import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const argv = collectArgs();

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const XrpAssetId = 2;

export async function main() {
	assert("paymentAsset" in argv, "Payment asset ID is required");

	const api = await getChainApi("porcini");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);

	// can be any extrinsic, using `system.remarkWithEvent` for simplicity
	const call = api.tx.system.remarkWithEvent("Hello World");
	const paymentInfo = await call.paymentInfo(caller.address);
	const estimatedFee = paymentInfo.partialFee.toString();

	const { paymentAsset } = argv as unknown as { paymentAsset: number };

	// querying the dex for swap price, to determine the `maxPayment` you are willing to pay
	const {
		Ok: [amountIn],
	} = (
		await // eslint-disable-next-line @typescript-eslint/no-explicit-any
		(api.rpc as any).dex.getAmountsIn(estimatedFee, [paymentAsset, XrpAssetId])
	).toJSON();
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

	await api.disconnect();
}

main();
