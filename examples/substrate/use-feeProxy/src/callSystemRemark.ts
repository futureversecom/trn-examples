import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const ASTO_ASSET_ID = 17_508;
const XRP_ASSET_ID = 2;

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `system.remarkWithEvent` call, and pay gas
 * in ASTO token.
 *
 * Assumes the caller has some ASTO balance.
 */
withChainApi("porcini", async (api, caller) => {
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const remarkCall = api.tx.system.remarkWithEvent("Hello World");
	const paymentInfo = await remarkCall.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	// querying the dex for swap price, to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		ASTO_ASSET_ID,
		XRP_ASSET_ID,
	])) as unknown as AmountsIn;
	// allow a buffer to prevent extrinsic failure
	const maxPayment = Number(amountIn * 1.5).toFixed();

	const feeProxyCall = api.tx.feeProxy.callWithFeePreferences(
		ASTO_ASSET_ID,
		maxPayment,
		remarkCall
	);

	const { result } = await sendExtrinsic(feeProxyCall, caller, { log: console });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		"System.Remarked",
	]);

	console.log("Extrinsic Result:", {
		proxy: formatEventData(proxyEvent.event),
		remark: formatEventData(remarkEvent.event),
	});
});
