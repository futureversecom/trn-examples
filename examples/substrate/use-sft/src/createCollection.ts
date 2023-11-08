import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

/**
 * Use `sft.createCollection` extrinsic to create a new SFT collection.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionName = "MyCollection";
	const collectionOwner = caller.address;
	const metadataScheme = stringToHex("https://example.com/token/");
	const royaltiesSchedule = {
		entitlements: [[collectionOwner, 10_000 /* one percent */]],
	};

	logger.info(
		{
			parameters: {
				collectionName,
				collectionOwner,
				metadataScheme,
				royaltiesSchedule,
			},
		},
		`create a "sft.createCollection" extrinsic`
	);
	const extrinsic = api.tx.sft.createCollection(
		collectionName,
		collectionOwner,
		metadataScheme,
		royaltiesSchedule
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [createEvent] = filterExtrinsicEvents(result.events, ["Sft.CollectionCreate"]);

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
