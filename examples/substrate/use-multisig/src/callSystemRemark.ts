import { blake2AsHex } from "@polkadot/util-crypto";
import {
	createDispatcher,
	filterExtrinsicEvents,
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

	const [multiAddress, signatories] = createMultisigAddress(
		callers.map((caller) => caller.address),
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
		const { estimate, signAndSend } = createDispatcher(
			api,
			caller.address,
			[],
			nativeWalletSigner(caller)
		);
		const otherSignatories = signatories.filter((signatory) => signatory !== caller.address);
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
		const [newEvent, approvedEvent, executedEvent, remarkedEvent] = filterExtrinsicEvents(events, [
			"multisig.NewMultisig",
			"multisig.MultisigApproval",
			"multisig.MultisigExecuted",
			"system.Remarked",
		]);

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
