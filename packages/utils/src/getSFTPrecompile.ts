import { Contract, Wallet } from "ethers";

import { getEthersProvider } from "./getEthersProvider";

// Precompile address for sft precompile is 1731
export const SFT_PRECOMPILE_ADDRESS = "0x00000000000000000000000000000000000006c3";

export const SFT_PRECOMPILE_ABI = [
	"event InitializeSftCollection(address indexed collectionOwner, address indexed precompileAddress)",
	"function initializeCollection(address owner, bytes name, bytes metadataPath, address[] royaltyAddresses, uint32[] royaltyEntitlements) returns (address, uint32)",
];

export const getSFTPrecompile = (privateKey: string) => {
	const wallet = new Wallet(privateKey, getEthersProvider("porcini"));
	const sftPrecompile = new Contract(SFT_PRECOMPILE_ADDRESS, SFT_PRECOMPILE_ABI, wallet);

	// Create precompile contract
	return {
		sftPrecompile,
		wallet,
	};
};
