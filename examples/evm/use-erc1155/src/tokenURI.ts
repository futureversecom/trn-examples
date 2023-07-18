import { createToken, getERC1155Precompile } from "@trne/utils/getERC1155PrecompileContract";
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
	const initialIssuance = 123;
	const serialNumber = await createToken(erc1155Precompile, initialIssuance, wallet);
	const tokenUri = await erc1155Precompile.uri(serialNumber);
	assert(
		tokenUri === `https://example.com/sft/metadata${serialNumber}`,
		`Incorrect token uri ${tokenUri}`
	);
}

main();
