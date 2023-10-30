import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 269412;

/**
 * Use `sft.setBaseUri` extrinsic to update the collection `metadataSchheme`.
 *
 * Similar extrinsics are available to update different properties of a collection
 *  - setName
 *  - setOwner
 *  - setRoyaltiesSchedule
 *  Check out the pallet documentation (linked in README) for more details
 *
 * Assumes the caller is the owner of the collection, and has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const baseUri = stringToHex("https://example.com/token/");
	const collectionId = COLLECTION_ID;

	logger.info(
		{
			parameters: {
				collectionId,
				baseUri,
			},
		},
		`create a "sft.setBaseUri" extrinsic`
	);
	const extrinsic = api.tx.sft.setBaseUri(collectionId, baseUri);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [setEvent] = filterExtrinsicEvents(result.events, ["Sft.BaseUriSet"]);

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
