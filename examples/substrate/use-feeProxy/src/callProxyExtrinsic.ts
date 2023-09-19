import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { ASTO_ASSET_ID, XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Use `feeProxy.callWithFeePreferences` to trigger `system.remarkWithEvent` call via
 * `futurepass.proxyExtrinsic`, and have Futurepass account pays gas in ASTO.
 *
 * Assumes the caller has a valid Futurepass account and some ASTO balance in it.
 */
withChainApi("porcini", async (api, caller) => {
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const remarkCall = api.tx.system.remarkWithEvent("Hello World");
	const fpAccount = (await api.query.futurepass.holders(caller.address)).unwrap();

	console.log("Futurepass Details: ", {
		holder: caller.address,
		futurepass: fpAccount.toString(),
	});

	assert(fpAccount);

	// wrap `remarkCall` with `proxyCall`, effetively request Futurepass account to pay for gas
	const futurepassCall = api.tx.futurepass.proxyExtrinsic(fpAccount, remarkCall);
	const paymentInfo = await remarkCall.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	// querying the dex for swap price, to determine the `maxPayment` you are willing to pay in ASTO
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
		futurepassCall
	);

	const { result, extrinsicId } = await sendExtrinsic(feeProxyCall, caller, { log: console });
	const [proxyEvent, futurepassEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		"Futurepass.ProxyExecuted",
		"System.Remarked",
	]);

	console.log("Extrinsic ID:", extrinsicId);
	console.log("Extrinsic Result:", {
		proxy: formatEventData(proxyEvent.event),
		futurepass: formatEventData(futurepassEvent.event),
		remark: formatEventData(remarkEvent.event),
	});
});
