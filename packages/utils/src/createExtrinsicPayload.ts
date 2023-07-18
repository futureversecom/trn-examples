import { ApiPromise } from "@polkadot/api";
import type { SignerOptions } from "@polkadot/api/submittable/types";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { GenericSignerPayload } from "@polkadot/types";
import { blake2AsHex } from "@polkadot/util-crypto";

export async function createExtrinsicPayload(
	api: ApiPromise,
	account: string,
	method: SubmittableExtrinsic<"promise">["method"],
	options?: Partial<SignerOptions>
): Promise<[GenericSignerPayload, `0x${string}`]> {
	const { header, mortalLength, nonce } = await api.derive.tx.signingInfo(account);
	const eraOptions = {
		address: account,
		blockHash: header?.hash,
		blockNumber: header?.number,
		era: api.registry.createTypeUnsafe("ExtrinsicEra", [
			{
				current: header?.number,
				period: mortalLength,
			},
		]),
		genesisHash: api.genesisHash,
		method,
		nonce,
		runtimeVersion: api.runtimeVersion,
		signedExtensions: api.registry.signedExtensions,
		version: api.extrinsicVersion,
		...options,
	};

	const payload = api.registry.createTypeUnsafe("SignerPayload", [
		eraOptions,
	]) as unknown as GenericSignerPayload;
	const { data } = payload.toRaw();
	const hashed = data.length > (256 + 1) * 2 ? blake2AsHex(data) : data;
	const ethPayload = blake2AsHex(hashed);

	return [payload, ethPayload];
}
