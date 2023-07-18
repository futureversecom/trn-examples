import { getPublicProviderUrl, type NetworkName } from "@therootnetwork/api";
import { getDefaultProvider } from "ethers";

export function getEthersProvider(network: NetworkName) {
	return getDefaultProvider(getPublicProviderUrl(network));
}
