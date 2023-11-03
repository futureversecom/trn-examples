import { FUTUREPASS_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getFuturepassContract(fpAccount: string): Contract {
	return new Contract(fpAccount, [
		...FUTUREPASS_PRECOMPILE_ABI,
		"function registerDelegateWithSignature(address delegate, uint8 proxyType, uint32 deadline, bytes signature) external",
	]);
}
