import { Keyring } from "@polkadot/keyring";
import { u8aSorted, u8aToHex } from "@polkadot/util";
import { createKeyMulti, decodeAddress, ethereumEncode } from "@polkadot/util-crypto";

export type Signer = ReturnType<InstanceType<typeof Keyring>["addFromAddress"]>;

export function createMultisigAddress(signatories: string[], threshold: number) {
	const sortedSignatories = u8aSorted(signatories.map((signatory) => decodeAddress(signatory))).map(
		ethereumEncode
	);
	const multiAddress = createKeyMulti(sortedSignatories, threshold).slice(0, 20);
	return [u8aToHex(multiAddress), sortedSignatories] as [`0x${string}`, `0x${string}`[]];
}
