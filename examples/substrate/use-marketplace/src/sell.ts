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
 * Use `marketplace.sellNft` to list an NFT for fixed-price sale on the marketplace (id = 1).
 *
 * Assumes caller has NFT of collection id 1124 and XRP to pay gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionId = 1124;
	const marketplaceId = 1;
	const paymentAsset = XRP_ASSET_ID;
	const fixedPrice = 1_000_000; // 1 XRP
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
				fixedPrice,
				duration,
				marketplaceId,
			},
		},
		`create a "marketplace.sellNft" extrinsic`
	);
	const extrinsic = api.tx.marketplace.sellNft(
		collectionId,
		serialNumbers,
		null, // buyer
		paymentAsset,
		fixedPrice,
		duration,
		marketplaceId
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [saleEvent] = filterExtrinsicEvents(result.events, ["Marketplace.FixedPriceSaleList"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				saleEvent: formatEventData(saleEvent.event),
			},
		},
		"receive result"
	);
});
