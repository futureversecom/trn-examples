import { ApiPromise } from "@polkadot/api";
import { ERC20_ABI } from "@therootnetwork/evm";
import { ALICE } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { getERC20Contract } from "@trne/utils/getERC20Contract";
import { getFeeProxyPricePair } from "@trne/utils/getFeeProxyPricePair";
import { Logger } from "@trne/utils/getLogger";
import { ASTO_ASSET_ID, SYLO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { provideEthersProvider } from "@trne/utils/withEthersProvider";
import { BigNumber, utils } from "ethers";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferencs` to trigger `evm.call`
 *
 * Assumes the caller has some ASTO balance to pay for gas and some SYLO balance to demonstrate
 * the transfer
 */
withChainApi("porcini", async (api, caller, logger) => {
	/**
	 * 1. Create `emv.call` call
	 */
	const { call: evmCall, estimateGasCost } = await createEVMCall(caller.address, api, logger);

	/**
	 * 2. Determine the `maxPayment` in ASTO by estimate the gas cost and use `dex` to get a quote
	 */
	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		evmCall
	);
	const paymentInfo = await feeProxyCallForEstimation.paymentInfo(caller.address);

	// we need to add the actual estimate cost for the EVM layer call as part of the estimation
	const estimatedFee = BigNumber.from(paymentInfo.partialFee.toString())
		.add(estimateGasCost)
		.toString();

	// query the the `dex` to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		ASTO_ASSET_ID,
		XRP_ASSET_ID,
	])) as unknown as AmountsIn;

	// allow a buffer to avoid slippage, 5%
	const maxPayment = Number(amountIn * 1.05).toFixed();

	/**
	 * 3. Create and dispatch `feeProxy.callWithFeePreferences` extrinsic
	 */
	logger.info(
		{
			parameters: {
				paymentAsset: ASTO_ASSET_ID,
				maxPayment,
				call: evmCall.toJSON(),
			},
		},
		`create a "feeProxy.callWithFeePreferences"`
	);
	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(ASTO_ASSET_ID, maxPayment, evmCall);

	logger.info(`dispatch extrinsic as caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });

	const [proxyEvent, evmLogEvent, aliceTransferEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		"Evm.Log",
		{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				evmLogEvent: formatEventData(evmLogEvent.event),
				aliceTransferEvent: formatEventData(aliceTransferEvent.event),
			},
		},
		"receive result"
	);
});

async function createEVMCall(caller: string, api: ApiPromise, logger: Logger) {
	// setup the actual EVM transaction, as interface
	const { provider, wallet } = await provideEthersProvider("porcini");
	const transferToken = getERC20Contract(SYLO_ASSET_ID).connect(wallet);
	const transferAmount = utils.parseUnits("0.1", 18); // 0.1 SYLO
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

	logger.info(
		{
			parameters: {
				source: caller,
				target: transferToken.address,
				input: transferInput,
				gasLimit: transferEstimate.toString(),
				maxFeePerGas: maxFeePerGas.toString(),
			},
		},
		`create an "emv.call"`
	);

	return {
		call: api.tx.evm.call(
			caller,
			transferToken.address,
			transferInput,
			0,
			transferEstimate.toString(),
			maxFeePerGas.toString(),
			0,
			null,
			[]
		),
		estimateGasCost,
	};
}
