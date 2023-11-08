import { collectionIdToERC721Address, ERC721_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { Contract } from "ethers";

export function getERC721Contract(collectionId: number) {
	const address = collectionIdToERC721Address(collectionId);
	return new Contract(address, ERC721_PRECOMPILE_ABI);
}
