import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("paymentAsset" in argv, "Payment asset ID is required");

const ASTO_ASSET_ID = 17_508;

interface AmountsIn {
	Ok: [number, number];
}

/**
 * Simple `feeProxy.callWithFeePreferences` call that wraps around `system.remarkWithEvent` call
 */
withChainApi("porcini", async (api, caller) => {
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const call = api.tx.system.remarkWithEvent("Hello World");
	const paymentInfo = await call.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	const { paymentAsset } = argv as unknown as { paymentAsset: number };

	// querying the dex for swap price, to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (await api.rpc.dex.getAmountsIn(estimatedFee, [
		paymentAsset,
		ASTO_ASSET_ID,
	])) as unknown as AmountsIn;
	// allow a buffer to prevent extrinsic failure
	const maxPayment = Number(amountIn * 1.5).toFixed();

	const extrinsic = api.tx.feeProxy.callWithFeePreferences(paymentAsset, maxPayment, call);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		// depending on what extrinsic call you have, filter out the right event here
		"System.Remarked",
	]);

	console.log("Extrinsic Result", {
		proxy: proxyEvent.toJSON(),
		remark: remarkEvent.toJSON(),
	});
});
