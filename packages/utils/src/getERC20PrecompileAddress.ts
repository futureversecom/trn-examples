import { assetIdToERC20Address, ERC20_ABI } from "@therootnetwork/evm";
import { Contract } from "ethers";

import { getSignerWallet } from "./getSignerWallet";

const getERC20PrecompileForAssetId = (privateKey: string, assetId: string | number) => {
	const wallet = getSignerWallet(privateKey);

	const erc20PrecompileAddress = assetIdToERC20Address(assetId);

	// Create precompile contract
	return {
		erc20Precompile: new Contract(erc20PrecompileAddress, ERC20_ABI, wallet),
		wallet,
	};
};

export { ERC20_ABI, getERC20PrecompileForAssetId };
