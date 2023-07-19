import { getERC1155Precompile } from "@trne/utils/getERC1155PrecompileContract";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc1155PrecompileAddress
const erc1155PrecompileAddress = "0xbbbbbBbb00000864000000000000000000000000";

export async function main() {
	const { erc1155Precompile, wallet } = getERC1155Precompile(
		env.CALLER_PRIVATE_KEY,
		erc1155PrecompileAddress,
		COLLECTION_ID
	);

	const collectionOwner = await erc1155Precompile.connect(wallet).owner();
	console.log("collectionOwner:", collectionOwner.toString());
	assert(
		collectionOwner.toString() === wallet.address,
		`Owner of collection is not same as wallet address ${collectionOwner.toString()}`
	);
}

main();
