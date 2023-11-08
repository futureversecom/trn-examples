import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { XRP_ASSET_ID } from "@trne/utils/porcini-assets";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

interface OwnedTokens {
	0: number;
	1: number;
	2: number[];
}

/**
 * Use `marketplace.auctionNft` to list an NFT for auction sale on the marketplace (id = 1).
 *
 * Assumes caller has NFT of collection id 1124 and XRP to pay gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionId = 1124;
	const marketplaceId = 1;
	const paymentAsset = XRP_ASSET_ID;
	const reservePrice = 1_000_000; // 1 XRP
	const duration = 100; // the listing will expire in 100 blocks

	const ownedTokens = (await api.rpc.nft.ownedTokens(
		collectionId,
		caller.address,
		0,
		1
	)) as unknown as OwnedTokens;
	const serialNumbers = ownedTokens[2];
	assert(serialNumbers.length);

	logger.info(
		{
			parameters: {
				collectionId,
				serialNumbers,
				paymentAsset,
				reservePrice,
				duration,
				marketplaceId,
			},
		},
		`create a "marketplace.sellNft" extrinsic`
	);

	const extrinsic = api.tx.marketplace.auctionNft(
		collectionId,
		serialNumbers,
		paymentAsset,
		reservePrice,
		duration,
		marketplaceId
	);

	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [openEvent] = filterExtrinsicEvents(result.events, ["Marketplace.AuctionOpen"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				openEvent: formatEventData(openEvent.event),
			},
		},
		"receive result"
	);
});
