import { stringToHex } from "@polkadot/util";
import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const baseUri = stringToHex("https://example.com/token/");
	const { collectionId } = argv as unknown as { collectionId: number };

	const extrinsic = api.tx.nft.setBaseUri(collectionId, baseUri);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.BaseUriSet"]);

	console.log("Extrinsic Result", event.toJSON());
});
