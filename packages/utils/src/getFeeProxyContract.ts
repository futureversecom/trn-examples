import { FEE_PROXY_PRECOMPILE_ABI, FEE_PROXY_PRECOMPILE_ADDRESS } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getFeeProxyContract(): Contract {
	return new Contract(FEE_PROXY_PRECOMPILE_ADDRESS, FEE_PROXY_PRECOMPILE_ABI);
}
