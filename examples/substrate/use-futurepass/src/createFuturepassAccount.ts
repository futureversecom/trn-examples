import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

withChainApi("porcini", async (api, caller) => {
	const BOB = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const extrinsic = api.tx.futurepass.create(BOB);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Futurepass.FuturepassCreated"]);

	console.log("Extrinsic Result", event.toJSON());
});
