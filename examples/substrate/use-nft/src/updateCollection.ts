import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 1124;

/**
 * Use `nft.setBaseUri` extrinsic to update the collection `metadataScheme`.
 *
 * Similar extrinsics are available to update different properties of a collection
 *  - setMaxIssuanace
 *  - setName
 *  - setOwner
 *  - setRoyaltiesSchedule
 *  Check out the pallet documentation (linked in README) for more details
 *
 * Assumes the caller is the owner of the collection, and has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionId = COLLECTION_ID;
	const baseUri = stringToHex("https://example.com/token/");

	logger.info(
		{
			parameters: {
				collectionId,
				baseUri,
			},
		},
		`create a "nft.setBaseUri" extrinsic`
	);
	const extrinsic = api.tx.nft.setBaseUri(collectionId, baseUri);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [setEvent] = filterExtrinsicEvents(result.events, ["Nft.BaseUriSet"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				setEvent: formatEventData(setEvent.event),
			},
		},
		"receive result"
	);
});
