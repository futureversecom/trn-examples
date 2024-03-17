import type { ApiPromise } from "@polkadot/api";
import type { NetworkName } from "@therootnetwork/api";
import { cleanEnv, str } from "envalid";
import PrettyError from "pretty-error";

import { createKeyring, type Signer } from "./createKeyring";
import { getChainApi } from "./getChainApi";
import { getLogger, type Logger } from "./getLogger";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const pe = new PrettyError();

export async function withChainApi(
	network: NetworkName | "local" | `ws${string}`,
	callback: (api: ApiPromise, signer: Signer, logger: Logger) => Promise<void>
) {
	const logger = getLogger();

	const [api, signer] = await Promise.all([
		getChainApi(network),
		createKeyring(env.CALLER_PRIVATE_KEY),
	]);

	logger.info(`create an ApiPromise instance with network="${network}"`);
	logger.info(`create a Signer instance from a private key of address="${signer.address}"`);

	await callback(api, signer, logger).catch((error) => console.log(pe.render(error)));

	await api.disconnect();

	logger.info("call ended 🎉 ");
}
