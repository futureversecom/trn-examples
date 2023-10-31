import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

/**
 * Use `utility.batch` extrinsic to dispatch a group of extrinsics, potentially saving gas cost.
 *
 * Assumes the caller has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const calls = new Array(10).fill(1).map((n, i) => api.tx.system.remark(`Call ${n + i}`));

	logger.info(
		{
			parameters: [...calls],
		},
		`create a "utility.batch" extrinsic`
	);
	const extrinsic = api.tx.utility.batch(calls);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [batchEvent] = filterExtrinsicEvents(result.events, ["Utility.BatchCompleted"]);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				batchEvent: formatEventData(batchEvent.event),
			},
		},
		"receive result"
	);
});
