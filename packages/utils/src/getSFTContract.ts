import { SFT_PRECOMPILE_ABI, SFT_PRECOMPILE_ADDRESS } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getSFTContract(): Contract {
	return new Contract(SFT_PRECOMPILE_ADDRESS, SFT_PRECOMPILE_ABI);
}
