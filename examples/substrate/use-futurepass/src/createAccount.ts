import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import { Wallet } from "ethers";

/**
 * Use `futurepass.create` extrinsic to create a new FPass account
 *
 * Assumes the caller has XRP to pay for gas, and some ROOT to reserve the account
 */
withChainApi("porcini", async (api, caller, logger) => {
	const account = Wallet.createRandom();

	logger.info(
		{
			parameters: {
				account: account.address,
			},
		},
		`create a "futurepass.create" extrinsic`
	);
	const extrinsic = api.tx.futurepass.create(account.address);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [createEvent] = filterExtrinsicEvents(result.events, ["Futurepass.FuturepassCreated"]);

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
