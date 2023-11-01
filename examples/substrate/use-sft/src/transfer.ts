import { BOB } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 269412;
const TOKEN_ID = 0;

/**
 * Use `sft.transfer` extrinsic to transfer tokens to someone else.
 *
 * Assumes the caller is the owner of the transferring tokens, and has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const collectionId = COLLECTION_ID;
	const tokenId = TOKEN_ID;
	const quantity = 1;
	const newOwner = BOB;
	const serialNumbers = [[tokenId, quantity]] as unknown as [[number, number]];

	logger.info(
		{
			parameters: {
				collectionId,
				serialNumbers,
				newOwner,
			},
		},
		`create a "sft.transfer" extrinsic`
	);
	const extrinsic = api.tx.sft.transfer(collectionId, serialNumbers, newOwner);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [transferEvent] = filterExtrinsicEvents(result.events, ["Sft.Transfer"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				transferEvent: formatEventData(transferEvent.event),
			},
		},
		"receive result"
	);
});
