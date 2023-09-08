import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const ASTO_ASSET_ID = 17_508;
const XRP_ASSET_ID = 2;

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Simple `feeProxy.callWithFeePreferences` call that wraps around `system.remarkWithEvent` call
 *
 * Assumes the caller has some ASTO balance
 */
withChainApi("porcini", async (api, caller) => {
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const call = api.tx.system.remarkWithEvent("Hello World");
	const paymentInfo = await call.paymentInfo(caller.address);
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

	const extrinsic = api.tx.feeProxy.callWithFeePreferences(ASTO_ASSET_ID, maxPayment, call);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		// depending on what extrinsic call you have, filter out the right event here
		"System.Remarked",
	]);

	console.log("Extrinsic Result:", {
		proxy: proxyEvent.event.data.toJSON(),
		remark: remarkEvent.event.data.toJSON(),
	});
});
