import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const quantity = 10;
	const tokenOwner = caller.address;
	const { collectionId } = argv as unknown as { collectionId: number };

	const extrinsic = api.tx.nft.mint(collectionId, quantity, tokenOwner);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.Mint"]);

	console.log("Extrinsic Result", event.toJSON());
});
