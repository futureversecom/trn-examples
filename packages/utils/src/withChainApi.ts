import type { ApiPromise } from "@polkadot/api";
import type { NetworkName } from "@therootnetwork/api";
import { cleanEnv, str } from "envalid";
import PrettyError from "pretty-error";

import { createKeyring, type Signer } from "./createKeyring";
import { getChainApi } from "./getChainApi";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const pe = new PrettyError();

export async function withChainApi(
	network: NetworkName | "local",
	callback: (api: ApiPromise, signer: Signer) => Promise<void>
) {
	const [api, signer] = await Promise.all([
		getChainApi(network),
		createKeyring(env.CALLER_PRIVATE_KEY),
	]);

	await callback(api, signer).catch((error) => console.log(pe.render(error)));

	await api.disconnect();
}
