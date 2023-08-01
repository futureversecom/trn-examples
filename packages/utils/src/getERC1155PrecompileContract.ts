/* eslint-disable @typescript-eslint/no-explicit-any */
import { ERC1155_PRECOMPILE_ABI } from "@therootnetwork/evm";
import { Contract, ethers, Wallet } from "ethers";
import { getAddress } from "ethers/lib/utils";

import { getSignerWallet } from "./getSignerWallet";

const getCollectionPrecompileAddress = (collectionId: number) => {
	const collectionIdBin = (+collectionId).toString(2).padStart(22, "0");
	const parachainIdBin = (100).toString(2).padStart(10, "0");
	const collectionUuid = parseInt(collectionIdBin + parachainIdBin, 2);
	const collectionIdHex = (+collectionUuid).toString(16).padStart(8, "0");
	return getAddress(`0xBBBBBBBB${collectionIdHex.toUpperCase()}000000000000000000000000`);
};

const getERC1155Precompile = (
	privateKey: string,
	precompileAddress: string | null,
	collectionId: string | number | null
) => {
	const wallet = getSignerWallet(privateKey);

	const erc1155PrecompileAddress = precompileAddress
		? precompileAddress
		: getCollectionPrecompileAddress(collectionId as number);

	console.log("erc1155PrecompileAddress:", erc1155PrecompileAddress);
	const erc1155Precompile = new Contract(erc1155PrecompileAddress, ERC1155_PRECOMPILE_ABI, wallet);

	// Create precompile contract
	return {
		erc1155Precompile,
		wallet,
	};
};

async function createToken(
	erc1155Precompile: Contract,
	initialIssuance: number,
	tokenOwner: Wallet
) {
	const tokenName = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyToken"));
	const maxIssuance = 0;
	const tx = await erc1155Precompile
		.connect(tokenOwner)
		.createToken(tokenName, initialIssuance, maxIssuance, tokenOwner.address);
	const receipt = await tx.wait();
	const serialNumber = (receipt?.events as any)[0].args.serialNumber;
	console.log("serialNumber:", serialNumber);
	return serialNumber;
}

export { ERC1155_PRECOMPILE_ABI, getERC1155Precompile, createToken };
