import type { ApiPromise } from "@polkadot/api";
import type { NetworkName } from "@therootnetwork/api";
import { cleanEnv, str } from "envalid";

import { createKeyring, type Signer } from "./createKeyring";
import { getChainApi } from "./getChainApi";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function withChainApi(
	network: NetworkName | "local",
	callback: (api: ApiPromise, signer: Signer) => Promise<void>
) {
	const [api, signer] = await Promise.all([
		getChainApi(network),
		createKeyring(env.CALLER_PRIVATE_KEY),
	]);

	await callback(api, signer);

	await api.disconnect();
}
