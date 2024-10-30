import { createTestKeyring } from "@polkadot/keyring";
import { KeyringInstance, KeyringOptions } from "@polkadot/keyring/types";
import { bnToBn, objectSpread, u8aSorted } from "@polkadot/util";
import { createKeyMulti } from "@polkadot/util-crypto";
import { withChainApi } from "@trne/utils/withChainApi";

export const command = "createMultiSigWallet";
export const desc = "Create a multisig wallet from given addresses";

// Create a multisig wallet from given addresses"
withChainApi("porcini", async (api, caller, logger) => {
	const genesisHash = api.genesisHash;
	const signatoryList = [
		"0xFFfFffFF000000000000000000000000000003CD",
		"0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
		"0x6D1eFDE1BbF146EF88c360AF255D9d54A5D39408",
	];
	//	signatories.split(",");
	console.log("signatoryList::", signatoryList);
	const multiSigWalletName = "multiSigWallet";
	const threshold = 2;
	const ss58Format = 193;
	const options = {
		ss58Format,
		type: "ethereum",
	};
	const keyring = createTestKeyring(options as KeyringOptions, true);
	const multiSigOptions = {
		genesisHash: genesisHash.toString(),
		name: multiSigWalletName.trim(),
		tags: [],
	};
	const multiSigAddress = addMultisig(signatoryList, threshold, multiSigOptions, keyring);

	console.log("[1/3] Created multiSig address:", multiSigAddress);
	process.exit(0);
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
