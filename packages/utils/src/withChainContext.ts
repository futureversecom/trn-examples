import { NetworkName } from "@therootnetwork/api";
import PrettyError from "pretty-error";

import { ApiPromise, getChainApi } from "./getChainApi";
import { getLogger, Logger } from "./getLogger";

const pe = new PrettyError();

export async function withChainContext(
	network: string,
	callback: (api: ApiPromise, logger: Logger) => Promise<void>
) {
	const logger = getLogger();
	const api = await getChainApi(network as NetworkName);

	logger.info({ network }, `create an ApiPromise instance`);
	await callback(api, logger).catch((error) => console.log(pe.render(error)));

	await api.disconnect();

	logger.info("call ended 🎉 ");
}
