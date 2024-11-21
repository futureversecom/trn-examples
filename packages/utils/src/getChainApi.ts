import { ApiPromise } from "@polkadot/api";
import {
	getApiOptions,
	getLocalProvider,
	getProvider,
	getPublicProvider,
	NetworkName,
} from "@therootnetwork/api";
import "@therootnetwork/api-types";

async function getChainApi(name: NetworkName | "local" | `ws${string}`) {
	const api = await ApiPromise.create({
		noInitWarn: true,
		...getApiOptions(),
		...(name === "local"
			? getLocalProvider()
			: name === "root" || name === "porcini"
			? getPublicProvider(name)
			: getProvider(name)),
	});

	return api;
}

export { ApiPromise, getChainApi };
