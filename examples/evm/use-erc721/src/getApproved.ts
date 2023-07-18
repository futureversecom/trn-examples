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
	const bob = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const serialNumber = 0;

	const approveTx = await erc721Precompile.connect(wallet).approve(bob, serialNumber);
	await approveTx.wait();

	// Estimate contract call
	const approvedAddress = await erc721Precompile.connect(wallet).getApproved(serialNumber);

	console.log("approved::", approvedAddress.toString());
	assert(
		approvedAddress.toString() === bob.toString(),
		`Incorrect approved account ${approvedAddress.toString()}`
	);
}

main();
