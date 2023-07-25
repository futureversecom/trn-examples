import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const argv = collectArgs();

withChainApi("porcini", async (api, caller) => {
	const { tokenId, collectionId } = formatArgs();

	const tokenOwner = caller.address;
	const quantity = 10;
	const serialNumbers = [[tokenId, quantity]];

	const extrinsic = api.tx.sft.mint(collectionId, serialNumbers, tokenOwner);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Sft.Mint"]);

	console.log("Extrinsic Result", event.toJSON());
});

function formatArgs() {
	const { tokenId, collectionId } = argv as unknown as { tokenId: number; collectionId: number };

	return { tokenId, collectionId };
}
