import { u8aToHex } from "@polkadot/util";
import { createDispatcher, nativeWalletSigner } from "@therootnetwork/extrinsic";
import { createKeyring } from "@trne/utils/createKeyring";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";
import assert from "node:assert";

const { CHAIN_ENDPOINT, SIGNATORIES, CALLER_PRIVATE_KEY } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	SIGNATORIES: str(), // Comma separated signatories
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller to fund multi wallet address
});

/**
 * Use `futurepass.proxyExtrinsic` to call `system.remarkWithEvent` and have FPasss account
 * to pay for gas.
 *
 * Assume FPass account of the caller has XRP to pay for gas.
 */
withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const caller = createKeyring(CALLER_PRIVATE_KEY);
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

	const multiSigCall = api.tx.system.remarkWithEvent("Hello World");
	const u8a = multiSigCall.method.toU8a();
	const encodedCallData = u8aToHex(u8a);

	const signatoryList = SIGNATORIES.split(",");
	console.log("signatoryList::", signatoryList);
	const threshold = signatoryList.length;
	const maybeTimepoint = null;
	const storeCall = false;
	const maxWeight = 0;

	const call = await api.tx.multisig.asMulti(
		threshold,
		signatoryList,
		maybeTimepoint,
		encodedCallData,
		storeCall,
		maxWeight
	);

	const proxyExtrinsic = await api.tx.futurepass.proxyExtrinsic(fpAccount, call);
	logger.info(
		{
			parameters: {
				fpAccount,
				call,
			},
		},
		`create a "futurepass.proxyExtrinsic" extrinsic`
	);
	const { estimate, signAndSend } = createDispatcher(
		api,
		caller.address,
		[],
		nativeWalletSigner(caller)
	);

	const feeResult = await estimate(proxyExtrinsic);
	assert(feeResult.ok, (feeResult.value as Error).message);
	logger.info(
		{ parameters: { caller: caller.address, fee: feeResult.ok ? feeResult.value : undefined } },
		`dispatch extrinsic`
	);

	const result = await signAndSend(proxyExtrinsic, (status) => {
		logger.debug(status);
	});
	assert(result.ok, (result.value as Error).message);

	const { id, events } = result.value;
	console.log("events:", events);
	const multiSigEvent = events.find((event) => event.name === "multisig.NewMultisig");
	assert(multiSigEvent);
	logger.info(
		{
			result: {
				extrinsicId: id,
				multiSigEvent,
			},
		},
		"dispatch result"
	);
});
