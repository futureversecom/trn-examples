//import { getPublicProviderUrl } from "@therootnetwork/api";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, getDefaultProvider, Wallet } from "ethers";

// Precompile address for sft precompile is 1731
export const SFT_PRECOMPILE_ADDRESS = "0x00000000000000000000000000000000000006c3";

export const SFT_PRECOMPILE_ABI = [
	"event InitializeSftCollection(address indexed collectionOwner, address indexed precompileAddress)",
	"function initializeCollection(address owner, bytes name, bytes metadataPath, address[] royaltyAddresses, uint32[] royaltyEntitlements) returns (address, uint32)",
];

export const getSFTPrecompile = (privateKey: string) => {
	// const provider = new JsonRpcProvider(`http://127.0.0.1:9933`);
	const wallet = new Wallet(privateKey, getDefaultProvider(`http://127.0.0.1:9933`));
	const sftPrecompile = new Contract(SFT_PRECOMPILE_ADDRESS, SFT_PRECOMPILE_ABI, wallet);

	// Create precompiles contract
	return {
		sftPrecompile,
		wallet,
	};
};
