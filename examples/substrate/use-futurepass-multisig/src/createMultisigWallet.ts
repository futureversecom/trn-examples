import { createTestKeyring } from "@polkadot/keyring";
import { KeyringOptions } from "@polkadot/keyring/types";
import { bnToBn, objectSpread, u8aSorted } from "@polkadot/util";
import { createKeyMulti } from "@polkadot/util-crypto";
import { withChainContext } from "@trne/utils/withChainContext";
import { cleanEnv, str } from "envalid";

const { CHAIN_ENDPOINT, SIGNATORIES, WALLET_NAME, THRESHOLD } = cleanEnv(process.env, {
	CHAIN_ENDPOINT: str({ default: "porcini" }),
	SIGNATORIES: str(), // Comma separated signatories
	WALLET_NAME: str(), // private key of extrinsic caller
	THRESHOLD: str(),
});

/**
 * Create multisig wallet with the given signatories and threshold
 */
withChainContext(CHAIN_ENDPOINT, async (api, logger) => {
	const genesisHash = api.genesisHash;
	const signatoryList = SIGNATORIES.split(",");
	console.log("signatoryList::", signatoryList);
	const ss58Format = 193;
	const options = {
		ss58Format,
		type: "ethereum",
	};
	const keyring = createTestKeyring(options as KeyringOptions, true);
	const multiSigOptions = {
		genesisHash: genesisHash.toString(),
		name: WALLET_NAME.trim(),
		tags: [],
	};
	const multiSigAddress = addMultisig(signatoryList, THRESHOLD, multiSigOptions, keyring);

	console.log("[1/3] Created multiSig address:", multiSigAddress);
	logger.info(multiSigAddress, `Created multiSig address`);
});

function addMultisig(addresses, threshold, meta = {}, keyring: KeyringInstance) {
	let address = createKeyMulti(addresses, threshold);
	address = address.slice(0, 20); // for ethereum addresses
	// we could use `sortAddresses`, but rather use internal encode/decode so we are 100%
	const who = u8aSorted(addresses.map((who) => keyring.decodeAddress(who))).map((who) =>
		keyring.encodeAddress(who)
	);
	const meta1 = objectSpread({}, meta, {
		isMultisig: true,
		threshold: bnToBn(threshold).toNumber(),
		who,
	});
	const pair = keyring.addFromAddress(address, objectSpread({}, meta1, { isExternal: true }), null);
	console.log("MultiSig address created::", pair.address);
	return pair.address;
}
