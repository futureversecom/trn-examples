import type { u32, u128 } from "@polkadot/types";
import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("tokenId" in argv, "Token ID is required");
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const { tokenId, collectionId } = formatArgs();

	const quantity = 2;
	const newOwner = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const serialNumbers = [[tokenId, quantity]] as unknown as [[u32, u128]];

	const extrinsic = api.tx.sft.transfer(collectionId, serialNumbers, newOwner);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Sft.Transfer"]);

	console.log("Extrinsic Result", event.toJSON());
});

function formatArgs() {
	const { tokenId, collectionId } = argv as unknown as { tokenId: number; collectionId: number };

	return { tokenId, collectionId };
}
