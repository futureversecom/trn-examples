import { ERC20_ABI } from "@therootnetwork/evm";
import { ALICE } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { getFeeProxyPricePair } from "@trne/utils/getFeeProxyPricePair";
import { ASTO_ASSET_ID, SYLO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { provideEthersProvider } from "@trne/utils/withEthersProvider";
import { BigNumber, utils } from "ethers";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferencs` to trigger `evm.call` call
 *
 * Assumes the caller has some ASTO balance.
 */
withChainApi("porcini", async (api, caller, logger) => {
	// setup the evmCall
	const { provider, wallet } = await provideEthersProvider("porcini");
	const transferToken = getERC20Contract(SYLO_ASSET_ID).connect(wallet);
	const transferAmount = utils.parseUnits("1.0", 18); // 1 SYLO
	const transferInput = new utils.Interface(ERC20_ABI).encodeFunctionData("transfer", [
		ALICE,
		transferAmount,
	]);
	const transferEstimate = await transferToken.estimateGas.transfer(ALICE, transferAmount);
	const { maxFeePerGas, estimateGasCost } = await getFeeProxyPricePair(
		provider,
		transferEstimate,
		ASTO_ASSET_ID,
		0.05
	);
	const evmCall = api.tx.evm.call(
		caller.address,
		transferToken.address,
		transferInput,
		0,
		transferEstimate.toString(),
		maxFeePerGas.toString(),
		0,
		null,
		[]
	);

	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		evmCall
	);
	const feeProxyPaymentInfo = await feeProxyCallForEstimation.paymentInfo(caller.address);

	// we need to add the actual estimate cost for the EVM layer call as part of the estimation
	const estimatedFee = BigNumber.from(feeProxyPaymentInfo.partialFee.toString())
		.add(estimateGasCost)
		.toString();

	logger.info(`prepare a "evm.call" call with estimatedFee="${estimatedFee}"`);

	// query the the `dex` to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		ASTO_ASSET_ID,
		XRP_ASSET_ID,
	])) as unknown as AmountsIn;

	// allow a buffer to avoid slippage, 5%
	const maxPayment = Number(amountIn * 1.05).toFixed();
	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(ASTO_ASSET_ID, maxPayment, evmCall);
	logger.info(`dispatch a feeProxy call with maxPayment="${maxPayment}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });

	const [proxyEvent, aliceTransferEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				aliceTransferEvent: formatEventData(aliceTransferEvent.event),
			},
		},
		"receive result"
	);
});
