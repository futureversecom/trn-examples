import { collectionIdToERC721Address, ERC721_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { Contract } from "ethers";

import { getSignerWallet } from "./getSignerWallet";

const getERC721Precompile = (
	privateKey: string,
	precompileAddress: string,
	collectionId: string | number | null
) => {
	const wallet = getSignerWallet(privateKey);

	const erc721PrecompileAddress = precompileAddress
		? precompileAddress
		: collectionIdToERC721Address(collectionId as string);

	const erc721Precompile = new Contract(erc721PrecompileAddress, ERC721_PRECOMPILE_ABI, wallet);

	// Create precompiles contract
	return {
		erc721Precompile,
		wallet,
	};
};

export { ERC721_PRECOMPILE_ABI, getERC721Precompile };
