import { ApiPromise } from "@polkadot/api";
import {
	getApiOptions,
	getLocalProvider,
	getPublicProvider,
	NetworkName,
} from "@therootnetwork/api";

async function getChainApi(name: NetworkName | "local") {
	const api = await ApiPromise.create({
		noInitWarn: true,
		...getApiOptions(),
		...(name === "local" ? getLocalProvider() : getPublicProvider(name)),
	});

	return api;
}

export { ApiPromise, getChainApi };
