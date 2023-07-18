import { getERC1155Precompile, getSignerWallet } from "@trne/utils/getERC1155PrecompileContract";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
	BOB_PRIVATE_KEY: str(),
});

const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc1155PrecompileAddress
const erc1155PrecompileAddress = "0xbbbbbBbb00000864000000000000000000000000";

export async function main() {
	const { erc1155Precompile, wallet } = getERC1155Precompile(
		env.CALLER_PRIVATE_KEY,
		erc1155PrecompileAddress,
		COLLECTION_ID
	);

	const bobSigner = getSignerWallet(env.BOB_PRIVATE_KEY);

	const transferOwnershipTx = await erc1155Precompile
		.connect(wallet)
		.transferOwnership(bobSigner.address);
	const receipt = await transferOwnershipTx.wait();

	const { event } = (receipt?.events as any)[0];
	const { previousOwner, newOwner } = (receipt?.events as any)[0].args;
	assert(event === "OwnershipTransferred", `Incorrect event ${event}`);
	assert(
		previousOwner === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b",
		`Incorrect from field ${previousOwner}`
	);
	assert(newOwner === bobSigner.address, `Incorrect to field ${newOwner}`);

	const transferOwnershipBackTx = await erc1155Precompile
		.connect(bobSigner)
		.transferOwnership(wallet.address);
	await transferOwnershipTx.wait();
}

main();
