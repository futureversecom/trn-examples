import {
	FUTUREPASS_REGISTRAR_PRECOMPILE_ABI,
	FUTUREPASS_REGISTRAR_PRECOMPILE_ADDRESS,
} from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getFuturepassRegistrarContract(): Contract {
	return new Contract(FUTUREPASS_REGISTRAR_PRECOMPILE_ADDRESS, FUTUREPASS_REGISTRAR_PRECOMPILE_ABI);
}
