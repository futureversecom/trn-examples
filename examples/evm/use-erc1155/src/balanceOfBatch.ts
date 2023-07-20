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

	const initialIssuance1 = 101;
	const initialIssuance2 = 202;
	const serialNumber1 = await createToken(erc1155Precompile, initialIssuance1, wallet);
	const serialNumber2 = await createToken(erc1155Precompile, initialIssuance2, wallet);

	const bal1 = await erc1155Precompile.balanceOf(wallet.address, serialNumber1);
	const bal2 = await erc1155Precompile.balanceOf(wallet.address, serialNumber2);
	// Verify balanceOf works
	assert(
		bal1.toString() === initialIssuance1.toString(),
		`Incorrect balance for serialNumber ${serialNumber1}`
	);
	assert(
		bal2.toString() === initialIssuance2.toString(),
		`Incorrect balance for serialNumber ${serialNumber2}`
	);

	const balances = await erc1155Precompile.balanceOfBatch(
		[wallet.address, wallet.address],
		[serialNumber1, serialNumber2]
	);

	assert(
		balances[0].toNumber() === initialIssuance1,
		`Incorrect balance ${balances[0].toNumber()} for ${wallet.address}`
	);
	assert(
		balances[1].toNumber() === initialIssuance2,
		`Incorrect balance ${balances[1].toNumber()} for ${wallet.address}`
	);
}

main();
