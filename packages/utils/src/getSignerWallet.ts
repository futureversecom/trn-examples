import { getPublicProviderUrl } from "@therootnetwork/evm";
import { getDefaultProvider, Wallet } from "ethers";

export function getSignerWallet(privateKey: string) {
	return new Wallet(privateKey, getDefaultProvider(getPublicProviderUrl("porcini")));
}
