import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
	const api = await getChainApi("porcini");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);

	const futurepass = (await api.query.futurepass.holders(caller.address)).toString();
	// can be any extrinsic, using `system.remarkWithEvent` for simplicity sake
	const call = api.tx.system.remarkWithEvent("Hello World");

	const extrinsic = api.tx.futurepass.proxyExtrinsic(futurepass, call);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"Futurepass.ProxyExecuted",
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
