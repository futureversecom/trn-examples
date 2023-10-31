import { BN, hexToU8a } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";

/**
 * Use `utility.batch` extrinsic to dispatch a group of extrinsics with one set to failed
 * deliberately to demostrate how to extract and decode the error.
 *
 * Assumes the caller has some XRP to pay for gas.
 */
withChainApi("porcini", async (api, caller, logger) => {
	const calls = new Array(10).fill(1).map((n, i) => {
		// Force error as Asset ID 3 does not exist
		if (i === 6) return api.tx.assets.transfer(3, caller.address, 1);
		return api.tx.system.remark(`Call ${n + i}`);
	});

	logger.info(
		{
			parameters: [...calls],
		},
		`create a "utility.batch" extrinsic`
	);
	const extrinsic = api.tx.utility.batch(calls);

	logger.info(`dispatch extrinsic from caller="${caller.address}"`);
	const { result, extrinsicId } = await sendExtrinsic(extrinsic, caller, { log: logger });
	const [interrupptedEvent] = filterExtrinsicEvents(result.events, ["Utility.BatchInterrupted"]);

	const {
		event: {
			data: [index, err],
		},
	} = interrupptedEvent.toJSON() as {
		event: {
			data: [
				number,
				{
					module: {
						index: number;
						error: `0x${string}`;
					};
				}
			];
		};
	};

	const { section, name, docs } = api.registry.findMetaError({
		index: new BN(err.module.index),
		error: hexToU8a(err.module.error),
	});

	logger.info(
		{
			error: {
				index,
				code: `${section}.${name}`,
				docs,
			},
		},
		`batch interrupted`
	);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				interrupptedEvent: formatEventData(interrupptedEvent.event),
			},
		},
		"receive result"
	);
});
