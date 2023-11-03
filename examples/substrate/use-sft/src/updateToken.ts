import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 269412;
const TOKEN_ID = 0;

/**
 * Use `sft.setMaxIssuance` extrinsic to update the token `maxIssuance`.
 *
 * Assumes the caller is the owner of the token, and has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const maxIssuance = 1000;
	const tokenId = [COLLECTION_ID, TOKEN_ID] as [number, number];

	logger.info(
		{
			parameters: {
				tokenId,
				maxIssuance,
			},
		},
		`create a "sft.setMaxIssuance" extrinsic`
	);
	const extrinsic = api.tx.sft.setMaxIssuance(tokenId, maxIssuance);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [setEvent] = filterExtrinsicEvents(result.events, ["Sft.MaxIssuanceSet"]);

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
