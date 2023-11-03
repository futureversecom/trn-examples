import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

/**
 * Use `marketplace.bid` extrinsic to submit a bid on a listing.
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

	const amount = 1_000_000; // 1 XRP

	logger.info(
		{
			parameters: {
				listingId: listingId.toString(),
				amount,
			},
		},
		`create a "nft.bid" extrinsic`
	);
	const extrinsic = api.tx.marketplace.bid(listingId, amount);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [bidEvent] = filterExtrinsicEvents(result.events, ["Marketplace.Bid"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				bidEvent: formatEventData(bidEvent.event),
			},
		},
		"receive result"
	);
});
