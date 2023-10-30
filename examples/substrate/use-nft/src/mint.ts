import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 1124;

/**
 * Use `nft.mint` extrinsic to mint new tokens.
 *
 * Assumes the caller is the owner of the collection, and has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const quantity = 10;
	const tokenOwner = caller.address;
	const collectionId = COLLECTION_ID;

	logger.info(
		{
			parameters: {
				collectionId,
				quantity,
				tokenOwner,
			},
		},
		`create a "nft.mint" extrinsic`
	);

	const extrinsic = api.tx.nft.mint(collectionId, quantity, tokenOwner);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [mintEvent] = filterExtrinsicEvents(result.events, ["Nft.Mint"]);

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
