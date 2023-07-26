import { stringToHex } from "@polkadot/util";
import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const metadataScheme = stringToHex("https://example.com/token/");
	const { collectionId } = argv as unknown as { collectionId: number };

	const extrinsic = api.tx.sft.setBaseUri(collectionId, metadataScheme);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Sft.BaseUriSet"]);

	console.log("Extrinsic Result", event.toJSON());
});
