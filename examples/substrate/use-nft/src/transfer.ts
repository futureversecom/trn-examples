import { BOB } from "@trne/utils/accounts";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

const COLLECTION_ID = 1124;

/**
 * Use `nft.transfer` extrinsic to transfer tokens to someone else
 *
 * Assumes the caller is the owner of the transferring tokens, and has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const serialNumbers = [1, 2, 3];
	const newOwner = BOB;
	const collectionId = COLLECTION_ID;

	logger.info(
		{
			parameters: {
				collectionId,
				serialNumbers,
				newOwner,
			},
		},
		`create a "nft.mint" extrinsic`
	);

	const extrinsic = api.tx.nft.transfer(collectionId, serialNumbers, newOwner);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [transferEvent] = filterExtrinsicEvents(result.events, ["Nft.Transfer"]);

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
