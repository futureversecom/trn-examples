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
	const serialNumber = 19;

	const approveTx = await erc721Precompile.connect(wallet).approve(bob, serialNumber);
	const receipt = await approveTx.wait();

	const { event } = (receipt?.events as any)[0];
	const { owner, approved, tokenId } = (receipt?.events as any)[0].args;
	console.log("Event:", event);
	assert(event === "Approval", `Incorrect event ${event}`);
	assert(owner === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b", `Incorrect owner ${owner}`);
	assert(
		approved === "0x25451A4de12dcCc2D166922fA938E900fCc4ED24",
		`Incorrect approved ${approved}`
	);
	assert(tokenId.toNumber() === serialNumber, `Incorrect tokenId ${tokenId.toString()}`);
}

main();
