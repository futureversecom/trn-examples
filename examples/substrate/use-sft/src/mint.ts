import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 269412;
const TOKEN_ID = 0;

/**
 * Use `nft.mint` extrinsic to mint new tokens.
 *
 * Assumes the caller is the owner of the collection, and has some XRP to pay for gas.
 */

withChainApi("porcini", async (api, caller, logger) => {
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
	const [mintEvent] = filterExtrinsicEvents(result.events, ["Sft.Mint"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				mintEvent: formatEventData(mintEvent.event),
			},
		},
		"receive result"
	);
});
