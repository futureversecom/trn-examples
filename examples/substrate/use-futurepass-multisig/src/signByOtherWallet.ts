import { u8aToHex } from "@polkadot/util";
import { createDispatcher, nativeWalletSigner } from "@therootnetwork/extrinsic";
import { createKeyring } from "@trne/utils/createKeyring";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";
import assert from "node:assert";

const { CHAIN_ENDPOINT, SIGNATORIES, MULTISIG_WALLET, THRESHOLD, CALLER_PRIVATE_KEY } = cleanEnv(
	process.env,
	{
		CHAIN_ENDPOINT: str({ default: "porcini" }),
		SIGNATORIES: str(), // Comma separated signatories
		MULTISIG_WALLET: str(), // private key of extrinsic caller
		THRESHOLD: str(),
		CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller to fund multi wallet address
	}
);

/**
 * Sign multisig extrinisc with other signer
 *
 */
withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const caller = createKeyring(CALLER_PRIVATE_KEY);

	logger.info(
		{
			multisigWallet: {
				holder: caller.address,
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
	const storeCall = false;

	let timepoint = {};
	const allEntries = await api.query.multisig.multisigs.entries(MULTISIG_WALLET);
	allEntries.forEach(
		([
			{
				args: [accountId],
			},
			value,
		]) => {
			const time = JSON.parse(value);
			timepoint = time.when;
		}
	);
	const maybeTimepoint = api.registry.createType("Option<Timepoint>", timepoint);
	const maxWeight = 882400098;
	console.log("maybeTimepointData::", maybeTimepoint.toHuman());

	const call = await api.tx.multisig.asMulti(
		threshold,
		signatoryList,
		maybeTimepoint,
		encodedCallData,
		storeCall,
		maxWeight
	);

	logger.info(
		{
			parameters: {
				caller: caller.address,
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

	const feeResult = await estimate(call);
	assert(feeResult.ok, (feeResult.value as Error).message);
	logger.info(
		{ parameters: { caller: caller.address, fee: feeResult.ok ? feeResult.value : undefined } },
		`dispatch extrinsic`
	);

	const result = await signAndSend(call, (status) => {
		logger.debug(status);
	});
	assert(result.ok, (result.value as Error).message);

	const { id, events } = result.value;
	console.log("events::", events);
	const multiSigEvent = events.find((event) => event.name === "multisig.MultisigExecuted");
	assert(multiSigEvent);
	const systemRemarkEvent = events.find((event) => event.name === "system.Remarked");
	assert(systemRemarkEvent);
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
