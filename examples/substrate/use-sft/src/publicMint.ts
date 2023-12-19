import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 1124;
const TOKEN_ID = 0;

/**
 * Assuming a collection, a new token for a collection is created and togglePublicMint is enabled for this (collection, tokenId) combination
 *
 * Assumes the caller has XRP to pay for gas and caller is not the collection owner.
 */
withChainApi("local", async (api, caller, logger) => {
	const collectionId = COLLECTION_ID;
	const tokenId = TOKEN_ID;
	const tokenOwner = caller.address;
	const quantity = 10;
	const serialNumbers = [[tokenId, quantity]] as unknown as [[number, number]];

	logger.info(
		{
			parameters: {
				collectionId,
				serialNumbers,
				tokenOwner,
			},
		},
		`create a "sft.mint" extrinsic`
	);
	const extrinsic = api.tx.sft.mint(collectionId, serialNumbers, tokenOwner);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [mintFeePaidEvent] = filterExtrinsicEvents(result.events, ["Sft.MintFeePaid"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				mintEvent: formatEventData(mintFeePaidEvent.event),
			},
		},
		"receive result"
	);
});
