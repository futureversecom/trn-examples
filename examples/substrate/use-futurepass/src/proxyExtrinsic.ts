import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

/**
 * Use `futurepass.proxyExtrinsic` to call `system.remarkWithEvent` and have FPasss account
 * to pay for gas.
 *
 * Assume FPass account of the caller has XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const fpAccount = (await api.query.futurepass.holders(caller.address)).unwrapOr(undefined);
	assert(fpAccount);
	logger.info(
		{
			futurepass: {
				holder: caller.address,
				account: fpAccount.toString(),
			},
		},
		"futurepass details"
	);

	const call = api.tx.system.remarkWithEvent("Hello World");

	logger.info(
		{
			parameters: {
				fpAccount,
				call,
			},
		},
		`create a "futurepass.proxyExtrinsic" extrinsic`
	);
	const extrinsic = api.tx.futurepass.proxyExtrinsic(fpAccount, call);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
		"Futurepass.ProxyExecuted",
		// depending on what extrinsic call you have, filter out the right event here
		"System.Remarked",
	]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				proxyEvent: formatEventData(proxyEvent.event),
				remarkEvent: formatEventData(remarkEvent.event),
			},
		},
		"receive result"
	);
});
