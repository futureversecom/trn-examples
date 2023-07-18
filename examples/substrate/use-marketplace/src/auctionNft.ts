import { collectArgs } from "@trne/utils/collectArgs";
import { collectArrayFromString } from "@trne/utils/collectArrayFromString";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { utils as ethers } from "ethers";

const argv = collectArgs();

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const RootAsset = {
	assetId: 1,
	decimals: 6,
};

export async function main() {
	const { collectionId, serialNumbers } = formatArgs();

	const api = await getChainApi("porcini");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);

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

	await api.disconnect();
}

main();

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
