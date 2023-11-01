import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 269412;

/**
 * Use `sft.createToken` extrinsic to create a new token for a collection.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const tokenName = "MyToken";
	const initialIssuance = 0;
	const maxIssuance = null;
	const tokenOwner = caller.address;
	const collectionId = COLLECTION_ID;

	logger.info(
		{
			parameters: {
				collectionId,
				tokenName,
				initialIssuance,
				maxIssuance,
				tokenOwner,
			},
		},
		`create a "sft.createToken" extrinsic`
	);

	const extrinsic = api.tx.sft.createToken(
		collectionId,
		tokenName,
		initialIssuance,
		maxIssuance,
		tokenOwner
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [createEvent] = filterExtrinsicEvents(result.events, ["Sft.TokenCreate"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				createEvent: formatEventData(createEvent.event),
			},
		},
		"receive result"
	);
});
