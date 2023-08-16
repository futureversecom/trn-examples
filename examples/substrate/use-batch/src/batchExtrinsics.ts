import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const calls = new Array(10).fill(1).map((n, i) => api.tx.system.remark(`Call ${n + i}`));
	const extrinsic = api.tx.utility.batch(calls);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Utility.BatchCompleted"]);

	console.log("Extrinsic Result", event.toJSON());
});
