import { getERC721Precompile } from "@trne/utils/getERC721PrecompileContract";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc721PrecompileAddress
const erc721PrecompileAddress = "0xaaAAAAAA0001A864000000000000000000000000";

export async function main() {
	const { erc721Precompile, wallet } = getERC721Precompile(
		env.CALLER_PRIVATE_KEY,
		erc721PrecompileAddress,
		COLLECTION_ID
	);

	const tokenId = 0;
	const ownerOf = await erc721Precompile.connect(wallet).ownerOf(tokenId);
	console.log("ownerOf:", ownerOf.toString());
	assert(
		ownerOf.toString() === wallet.address,
		`Onwer of ${tokenId} is not same as wallet address ${ownerOf.toString()}`
	);
}

main();
