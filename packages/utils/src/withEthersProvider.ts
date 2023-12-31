import type { NetworkName } from "@therootnetwork/api";
import { getPublicProviderUrl } from "@therootnetwork/evm";
import { cleanEnv, str } from "envalid";
import { providers, Wallet } from "ethers";
import PrettyError from "pretty-error";

import { getLogger, type Logger } from "./getLogger";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const pe = new PrettyError();

export type EthersProvider = providers.JsonRpcProvider;

export async function withEthersProvider(
	network: NetworkName | "local",
	callback: (provider: EthersProvider, wallet: Wallet, logger: Logger) => Promise<void>
) {
	const { provider, wallet, logger } = await provideEthersProvider(network);

	await callback(provider, wallet, logger).catch((error) => {
		console.log(pe.render(error));
	});

	logger.info("call ended 🎉 ");
}

export async function provideEthersProvider(network: NetworkName | "local") {
	const logger = getLogger();

	const provider = getEthersProvider(network);

	const wallet = new Wallet(env.CALLER_PRIVATE_KEY, provider);
	logger.info(`create a Wallet instance from a private key of address="${wallet.address}"`);

	return { provider, wallet, logger };
}

export function getEthersProvider(network: NetworkName | "local") {
	const logger = getLogger();

	const provider = new providers.JsonRpcProvider(
		network !== "local" ? getPublicProviderUrl(network) : "http://localhost:9933"
	);
	logger.info(`create a JsonRpcProvider instance with network="${network}"`);
	return provider;
}
