import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `system.remarkWithEvent` call via
 * `futurepass.proxyExtrinsic`, and have Futurepass account pays gas in ASTO.
 *
 * Assumes the caller has a valid Futurepass account and some ASTO balance to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	/**
	 * 1. Create `futurepass.proxyExtrinsic` call that wraps around `system.remarkWithEvent` call
	 */
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
	const remarkCall = api.tx.system.remarkWithEvent("Hello World");
	logger.info(
		{
			parameters: {
				futurepass: fpAccount,
				call: remarkCall.toJSON(),
			},
		},
		`create a "futurepass.proxyExtrinsic"`
	);
	const futurepassCall = api.tx.futurepass.proxyExtrinsic(fpAccount, remarkCall);

	/**
	 * 2. Determine the `maxPayment` in ASTO by estimate the gas cost and use `dex` to get a quote
	 */
	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		futurepassCall
	);
	const paymentInfo = await feeProxyCallForEstimation.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

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

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });
	const [proxyEvent, futurepassEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		"Futurepass.ProxyExecuted",
		"System.Remarked",
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				futurepassEvent: formatEventData(futurepassEvent.event),
				remarkEvent: formatEventData(remarkEvent.event),
			},
		},
		"receive result"
	);
});
