import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const serialNumbers = [1, 2, 3];
	const newOwner = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const { collectionId } = argv as unknown as { collectionId: number };

	const extrinsic = api.tx.nft.transfer(collectionId, serialNumbers, newOwner);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.Transfer"]);

	console.log("Extrinsic Result", event.toJSON());
});
