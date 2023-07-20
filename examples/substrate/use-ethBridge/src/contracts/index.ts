import { Contract, Wallet } from "ethers";

import BridgeAbi from "./abi/Bridge.json";
import Erc20PegAbi from "./abi/ERC20Peg.json";
import Erc20TokenAbi from "./abi/ERC20Token.json";
import Erc721PegAbi from "./abi/ERC721Peg.json";
import Erc721TokenAbi from "./abi/ERC721Token.json";

const EthNetwork = {
	goerli: {
		BridgeAddress: "0xc48cc24cd6A119bDF677876e06D2E3a1946FEB1d",
		Erc20PegAddress: "0xB40Cf258CAd4c337dB4e52b57eDc333c3E2720A3",
		Erc721PegAddress: "0xBcA77De20128DCb54560F4607d799d1FD4968d61",
	},

	homestead: {
		BridgeAddress: "0x110fd9a44a056cb418D07F7d9957D0303F0020e4",
		Erc20PegAddress: "0xE9410B5AA32b270154c37752EcC0607c8c7aBC5F",
		Erc721PegAddress: "0xc90Eda4C3aF49717dfCeb4CB237A05ee4DfE3C4d",
	},
};

export function getBridgeContracts(network: "goerli" | "homestead", wallet: Wallet) {
	const bridgeContract = new Contract(EthNetwork[network].BridgeAddress, BridgeAbi, wallet);

	const erc20PegContract = new Contract(EthNetwork[network].Erc20PegAddress, Erc20PegAbi, wallet);

	const erc721PegContract = new Contract(
		EthNetwork[network].Erc721PegAddress,
		Erc721PegAbi,
		wallet
	);

	return { bridgeContract, erc20PegContract, erc721PegContract };
}

export function getERC20Contract(address: string, wallet: Wallet) {
	return new Contract(address, Erc20TokenAbi, wallet);
}

export function getERC721Contract(address: string, wallet: Wallet) {
	return new Contract(address, Erc721TokenAbi, wallet);
}
