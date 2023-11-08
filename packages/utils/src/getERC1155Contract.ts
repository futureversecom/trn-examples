import { collectionIdToERC1155Address, ERC1155_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getERC1155Contract(collectionId: number) {
	const address = collectionIdToERC1155Address(collectionId);
	return new Contract(address, ERC1155_PRECOMPILE_ABI);
}
