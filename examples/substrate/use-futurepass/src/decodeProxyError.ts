import { BN, hexToU8a } from "@polkadot/util";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { formatEventData } from "@trne/utils/formatEventData";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { withChainApi } from "@trne/utils/withChainApi";
import assert from "node:assert";

/**
 * Use `futurepass.proxyExtrinsic` to dispatch an extrinsic that is set to failed deliberately
 * to demostrate how to extract and decode the error.
 *
 * Assumes the FPass account has some XRP to pay for gas.
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

	// force error as Asset ID 3 does not exist
	const call = api.tx.assets.transfer(3, fpAccount, 1);

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
	const [executedEvent] = filterExtrinsicEvents(result.events, ["Proxy.ProxyExecuted"]);

	const { err } = executedEvent.event.data[0].toJSON() as {
		err: {
			module: {
				index: number;
				error: `0x${string}`;
			};
		};
	};

	const { section, name, docs } = api.registry.findMetaError({
		index: new BN(err.module.index),
		error: hexToU8a(err.module.error),
	});

	logger.info(
		{
			error: {
				code: `${section}.${name}`,
				docs,
			},
		},
		`proxy executed error`
	);

	logger.info(
		{
			result: {
				extrinsicId,
				blockNumber: result.blockNumber,
				executedEvent: formatEventData(executedEvent.event),
			},
		},
		"receive result"
	);
});
