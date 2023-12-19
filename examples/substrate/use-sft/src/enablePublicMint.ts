import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 1124;
const TOKEN_ID = 0;

/**
 * Assuming a collection and a new token for a collection is created.
 *
 * Assumes the caller has XRP to pay for gas.
 */
withChainApi("local", async (api, caller, logger) => {
	const tokenId = [COLLECTION_ID, TOKEN_ID] as [number, number];
	const enabled = true;

	logger.info(
		{
			parameters: {
				tokenId,
				enabled,
			},
		},
		`create a "sft.togglePublicMint" extrinsic`
	);

	let extrinsic = api.tx.sft.togglePublicMint(tokenId, enabled);

	logger.info(`dispatch extrinsic from caller/owner="${caller.address}"`);
	let { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	let [createEvent] = filterExtrinsicEvents(result.events, ["Sft.PublicMintToggle"]);

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

	// set mint fee for public minting

	const paymentAsset = 2;
	const price = 100;
	const pricingDetails = [paymentAsset, price];
	logger.info(
		{
			parameters: {
				tokenId,
				pricingDetails,
			},
		},
		`create a "sft.togglePublicMint" extrinsic`
	);

	extrinsic = api.tx.sft.setMintFee(tokenId, pricingDetails);

	logger.info(`dispatch extrinsic from caller/owner="${caller.address}"`);
	const response = await sendExtrinsic(extrinsic, caller, { log: logger });
	result = response.result;
	extrinsicId = response.extrinsicId;
	[createEvent] = filterExtrinsicEvents(result.events, ["Sft.MintPriceSet"]);

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
