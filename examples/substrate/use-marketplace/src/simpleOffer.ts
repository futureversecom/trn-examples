import { collectArgs } from "@trne/utils/collectArgs";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "assert";
import { utils as ethers } from "ethers";

const argv = collectArgs();

const RootAsset = {
	assetId: 1,
	decimals: 6,
};

withChainApi("porcini", async (api, caller) => {
	const { tokenId, marketplaceId } = formatArgs();

	const assetId = RootAsset.assetId;
	const amount = ethers.parseUnits("1", RootAsset.decimals).toString();

	const extrinsic = api.tx.marketplace.makeSimpleOffer(tokenId, amount, assetId, marketplaceId);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.Offer"]);

	console.log("Extrinsic Result", event.toJSON());
});

function formatArgs() {
	assert("tokenId" in argv, "Token ID is required");
	assert("marketplaceId" in argv, "Marketplace ID is required");

	const { tokenId, marketplaceId } = argv as unknown as {
		tokenId: number;
		marketplaceId: number;
	};

	return { tokenId, marketplaceId };
}
