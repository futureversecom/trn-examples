import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const futurepass = (await api.query.futurepass.holders(caller.address)).unwrap();
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
});
