import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `system.remarkWithEvent` call, and pay gas
 * in ASTO token.
 *
 * Assumes the caller has some ASTO balance.
 */
withChainApi("porcini", async (api, caller, logger) => {
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	logger.info(
		{
			parameters: {
				remark: "Hello World",
			},
		},
		`create a "system.remarkWithEvent"`
	);
	const remarkCall = api.tx.system.remarkWithEvent("Hello World");
	// we need a dummy feeProxy call (with maxPayment=0) to do a proper fee estimation
	const feeProxyCallForEstimation = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		0,
		remarkCall
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

	logger.info(
		{
			parameters: {
				paymentAsset: ASTO_ASSET_ID,
				maxPayment,
				call: remarkCall.toJSON(),
			},
		},
		`create a "feeProxy.callWithFeePreferences"`
	);
	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		maxPayment,
		remarkCall
	);

	logger.info(`dispatch extrinsic as caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: logger });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		"System.Remarked",
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				remarkEvent: formatEventData(remarkEvent.event),
			},
		},
		"receive result"
	);
});
