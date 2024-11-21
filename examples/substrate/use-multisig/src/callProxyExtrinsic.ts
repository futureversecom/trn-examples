import { BN, hexToU8a } from "@polkadot/util";
import { blake2AsHex } from "@polkadot/util-crypto";
import {
	createDispatcher,
	filterExtrinsicEvents,
	futurepassWrapper,
	nativeWalletSigner,
} from "@therootnetwork/extrinsic";
import { createKeyring } from "@trne/utils/createKeyring";
import { createMultisigAddress } from "@trne/utils/createMultisigAddress";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";
import assert from "node:assert";

const { CHAIN_ENDPOINT, CALLER_1_PRIVATE_KEY, CALLER_2_PRIVATE_KEY, CALLER_3_PRIVATE_KEY } =
	cleanEnv(process.env, {
		CHAIN_ENDPOINT: str({ default: "porcini" }),
		CALLER_1_PRIVATE_KEY: str(),
		CALLER_2_PRIVATE_KEY: str(),
		CALLER_3_PRIVATE_KEY: str(),
	});

/**
 * Use `multisig.asMulti` to handle a multisig call, which is a simple `system.remark`
 *
 * Assumes each callers has XRP for gas.
 */

withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const thredshold = 3;
	const callers = [CALLER_1_PRIVATE_KEY, CALLER_2_PRIVATE_KEY, CALLER_3_PRIVATE_KEY].map(
		createKeyring
	);

	const fpassAddresses = (
		await Promise.all(
			callers.map(async (caller) => {
				const fpass = await api.query.futurepass.holders(caller.address);
				assert(fpass.isSome);
				return [caller.address, fpass.toString()];
			})
		)
	).reduce((map, [address, fpass]) => {
		map[address] = fpass;
		return map;
	}, {} as Record<string, string>);

	const [multiAddress, signatories] = createMultisigAddress(
		callers.map((caller) => fpassAddresses[caller.address]),
		thredshold
	);

	logger.info(
		{
			signatories,
			multisig: multiAddress,
			thredshold,
		},
		`create a multisig address derived from 3 callers`
	);

	const remark = "Hello Multisig!";
	logger.info(
		{
			parameters: {
				remark,
			},
		},
		`create a "system.remarkWithEvent"`
	);

	const remarkCall = api.tx.system.remarkWithEvent(remark);
	const paymentInfo = await remarkCall.paymentInfo(multiAddress);
	const maxWeight = paymentInfo.weight.toJSON() as unknown as number;
	const callData = remarkCall.method.toHex();
	const callHash = blake2AsHex(callData);

	// loop through the callers and submit "asMulti" extrinsic to execute the multisig call
	for (const caller of callers) {
		const fpassAddress = fpassAddresses[caller.address];
		const { estimate, signAndSend } = createDispatcher(
			api,
			caller.address,
			[futurepassWrapper(fpassAddress)],
			nativeWalletSigner(caller)
		);

		// convert other signatories to FPass addresses
		const otherSignatories = signatories.filter((signatory) => signatory !== fpassAddress);
		const timepoint = await api.query.multisig.multisigs(multiAddress, callHash);
		const timepointWhen = timepoint.isSome ? timepoint.unwrap().when : null;

		logger.info(
			{
				parameters: {
					thredshold,
					otherSignatories,
					timepointWhen,
					callData,
					maxWeight,
				},
			},
			`create a "multisig.asMulti"`
		);

		const asMultiCall = api.tx.multisig.asMulti(
			thredshold,
			otherSignatories,
			timepointWhen,
			callData,
			false,
			maxWeight
		);

		const feeResult = await estimate(asMultiCall);
		assert(feeResult.ok, (feeResult.value as Error).message);
		logger.info(
			{ parameters: { caller: caller.address, fee: feeResult.ok ? feeResult.value : undefined } },
			`dispatch extrinsic`
		);

		const result = await signAndSend(asMultiCall, (status) => {
			logger.debug(status);
		});

		if (!result.ok) {
			const error = result.value as Error;
			if (error?.cause && (error.cause as { name: string }).name === "AlreadyApproved") {
				logger.info(
					{
						approval: caller.address,
					},
					"Already approved by this address"
				);
				continue;
			}

			logger.error({ cause: error.cause }, error.message);
			throw error;
		}

		const { id, events } = result.value;

		// When use `proxyExtrinsic`, error sometime is hidden in the `proxy.ProxyExecuted` event
		// that's why we need to explicitly check the content of the event data
		const [executedEvent] = filterExtrinsicEvents(events, ["proxy.ProxyExecuted"]);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (executedEvent && (executedEvent?.data?.result as any)?.err) {
			const err: {
				module: {
					index: number;
					error: `0x${string}`;
				};
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
			} = (executedEvent.data.result as any)?.err;

			const { section, name, docs } = api.registry.findMetaError({
				index: new BN(err.module.index),
				error: hexToU8a(err.module.error),
			});

			if (name === "AlreadyApproved") {
				logger.info(
					{
						approval: caller.address,
					},
					"Already approved by this address"
				);
				continue;
			}

			const error = new Error("Proxy executed failed", { cause: { name, section, docs } });

			logger.error({ cause: error.cause }, error.message);
			throw error;
		}

		const [newEvent, approvedEvent, remarkedEvent] = filterExtrinsicEvents(events, [
			"multisig.NewMultisig",
			"multisig.MultisigApproval",
			"multisig.MultisigExecuted",
			"system.Remarked",
		]);

		console.log({ newEvent, approvedEvent, executedEvent });
		assert(!!newEvent || !!approvedEvent || !!executedEvent);
		logger.info(
			{
				result: {
					extrinsicId: id,
					newEvent,
					approvedEvent,
					executedEvent,
					remarkedEvent,
				},
			},
			"dispatch result"
		);
	}
});
