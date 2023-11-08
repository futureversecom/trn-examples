import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

/**
 * Use `marketplace.buy` extrinsic to buy NFT from a listing.
 *
 * Assume caller has balance of required token to buy and XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionId = 1124;
	// pick up the first available listing
	const collectionListing = (
		await api.query.marketplace.openCollectionListings.keys(collectionId)
	).shift();

	assert(collectionListing);
	const {
		args: [, listingId],
	} = collectionListing;

	logger.info(
		{
			parameters: {
				listingId: listingId.toString(),
			},
		},
		`create a "nft.buy" extrinsic`
	);
	const extrinsic = api.tx.marketplace.buy(listingId);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [completeEvent] = filterExtrinsicEvents(result.events, [
		"Marketplace.FixedPriceSaleComplete",
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				completeEvent: formatEventData(completeEvent.event),
			},
		},
		"receive result"
	);
});
