import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";

const argv = collectArgs();
assert("collectionId" in argv, "Collection ID is required");

withChainApi("porcini", async (api, caller) => {
	const tokenName = "MyToken";
	const initialIssuance = 10;
	const maxIssuance = 1000;
	const tokenOwner = caller.address;
	const { collectionId } = argv as unknown as { collectionId: number };

	const extrinsic = api.tx.sft.createToken(
		collectionId,
		tokenName,
		initialIssuance,
		maxIssuance,
		tokenOwner
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Sft.TokenCreate"]);

	console.log("Extrinsic Result", event.toJSON());

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_collectionId, tokenId] = (
		event.toJSON() as {
			event: {
				data: [[number, number]];
			};
		}
	).event.data[0];
	console.log("Token ID", tokenId);
});
