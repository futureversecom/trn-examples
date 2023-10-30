import { stringToHex } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

/**
 * Use `nft.createCollection` extrinsic to create a new NFT collection.
 *
 * Assumes the caller has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const name = "MyCollection";
	const initialIssuance = 0; // start from token 0
	const maxIssuance = null; // no max issuance
	const tokenOwner = caller.address;
	const metadataScheme = stringToHex("https://example.com/token/");
	const royaltiesSchedule = {
		entitlements: [[tokenOwner, 10_000 /* one percent */]],
	};
	const crossChainCompatibility = { xrpl: false };

	logger.info(
		{
			parameters: {
				name,
				initialIssuance,
				maxIssuance,
				tokenOwner,
				metadataScheme,
				royaltiesSchedule,
				crossChainCompatibility,
			},
		},
		`create a "nft.createCollection" extrinsic`
	);
	const extrinsic = api.tx.nft.createCollection(
		name,
		initialIssuance,
		maxIssuance,
		tokenOwner,
		metadataScheme,
		royaltiesSchedule,
		crossChainCompatibility
	);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [createEvent] = filterExtrinsicEvents(result.events, ["Nft.CollectionCreate"]);

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
