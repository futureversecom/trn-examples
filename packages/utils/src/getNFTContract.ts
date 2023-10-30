import { NFT_PRECOMPILE_ABI, NFT_PRECOMPILE_ADDRESS } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getNFTContract(): Contract {
	return new Contract(NFT_PRECOMPILE_ADDRESS, NFT_PRECOMPILE_ABI);
}
