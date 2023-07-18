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

	const transferOwnershipTx = await erc721Precompile.connect(wallet).renounceOwnership();
	const receipt = await transferOwnershipTx.wait();

	const { event } = (receipt?.events as any)[0];
	console.log("event::", event);
	console.log("(receipt?.events as any)[0].args::", (receipt?.events as any)[0].args);
	const { previousOwner, newOwner } = (receipt?.events as any)[0].args;
	assert(event === "OwnershipTransferred", `Incorrect event ${event}`);
	assert(
		previousOwner === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
		`Incorrect from field ${previousOwner}`
	);
	assert(
		newOwner === "0x0000000000000000000000000000000000000000",
		`Incorrect to field ${newOwner}`
	);
}

main();
