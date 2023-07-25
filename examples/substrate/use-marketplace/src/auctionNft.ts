import { collectArgs } from "@trne/utils/collectArgs";
import { collectArrayFromString } from "@trne/utils/collectArrayFromString";
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
	const { collectionId, serialNumbers } = formatArgs();

	const duration = null;
	const marketplaceId = 2;
	const paymentAsset = RootAsset.assetId;
	const reservePrice = ethers.parseUnits("1", RootAsset.decimals).toString();

	const extrinsic = api.tx.marketplace.auctionNft(
		collectionId,
		serialNumbers,
		paymentAsset,
		reservePrice,
		duration,
		marketplaceId
	);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["Nft.AuctionOpen"]);

	console.log("Extrinsic Result", event.toJSON());
});

function formatArgs() {
	assert("collectionId" in argv, "Collection ID is required");
	assert("serialNumbers" in argv, "Serial numbers are required");

	const { collectionId, serialNumbers: serialNumbersString } = argv as unknown as {
		collectionId: number;
		serialNumbers: string;
	};
	const serialNumbers = collectArrayFromString(serialNumbersString);

	return { collectionId, serialNumbers };
}
