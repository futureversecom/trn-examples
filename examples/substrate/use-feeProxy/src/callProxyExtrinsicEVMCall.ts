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
import assert from "node:assert";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `emv.call` call via
 * `futurepass.proxyExtrinsic`, and have Futurepass account pays gas in ASTO.
 *
 * Assumes the caller has a valid Futurepass account, some ASTO balance to pay for gas and
 * some SYLO balance to demonstrate the transfer
 */
withChainApi("porcini", async (api, caller, logger) => {
	const fpAccount = (await api.query.futurepass.holders(caller.address)).unwrap();
	logger.info(
		{
			futurepass: {
				holder: caller.address,
				account: fpAccount.toString(),
			},
		},
		"futurepass details"
	);
	assert(fpAccount);

	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const { call: evmCall, estimateGasCost } = await createEVMCall(fpAccount.toString(), api, logger);
	// wrap `remarkCall` with `proxyCall`, effetively request Futurepass account to pay for gas
	logger.info(
		{
			parameters: {
				futurepass: fpAccount,
				call: evmCall.toJSON(),
			},
		},
		`create a "futurepass.proxyExtrinsic"`
	);
	const futurepassCall = api.tx.futurepass.proxyExtrinsic(fpAccount, evmCall);
	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		futurepassCall
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

	logger.info(
		{
			parameters: {
				paymentAsset: ASTO_ASSET_ID,
				maxPayment,
				call: futurepassCall.toJSON(),
			},
		},
		`create a "feeProxy.callWithFeePreferences"`
	);
	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		maxPayment,
		futurepassCall
	);

	logger.info(`dispatch extrinsic as caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });
	const [proxyEvent, futurepassEvent, evmLogEvent, aliceTransferEvent] = filterExtrinsicEvents(
		result.events,
		[
			"FeeProxy.CallWithFeePreferences",
			"Futurepass.ProxyExecuted",
			"Evm.Log",
			{ name: "Assets.Transferred", key: "to", data: { value: ALICE, type: "T::AccountId" } },
		]
	);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				futurepassEvent: formatEventData(futurepassEvent.event),
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
