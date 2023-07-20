import { Contract, Wallet } from "ethers";

import BridgeAbi from "./abi/Bridge.json";
import Erc20PegAbi from "./abi/ERC20Peg.json";
import Erc20TokenAbi from "./abi/ERC20Token.json";

const EthNetwork = {
	goerli: {
		Erc20PegAddress: "0xB40Cf258CAd4c337dB4e52b57eDc333c3E2720A3",
		BridgeAddress: "0xc48cc24cd6A119bDF677876e06D2E3a1946FEB1d",
	},

	homestead: {
		Erc20PegAddress: "0xE9410B5AA32b270154c37752EcC0607c8c7aBC5F",
		BridgeAddress: "0x110fd9a44a056cb418D07F7d9957D0303F0020e4",
	},
};

export function getBridgeContracts(network: "goerli" | "homestead", wallet: Wallet) {
	const bridgeContract = new Contract(EthNetwork[network].BridgeAddress, BridgeAbi, wallet);

	const erc20PegContract = new Contract(EthNetwork[network].Erc20PegAddress, Erc20PegAbi, wallet);

	return { bridgeContract, erc20PegContract };
}

export function getERC20Contract(address: string, wallet: Wallet) {
	return new Contract(address, Erc20TokenAbi, wallet);
}
