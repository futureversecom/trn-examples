import { getERC721Precompile, getSignerWallet } from "@trne/utils/getERC721PrecompileContract";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
	BOB_PRIVATE_KEY: str(),
});

const serialNumber = 43;
const COLLECTION_ID = null; // If user knows the collection id, can pass collection over erc721PrecompileAddress
const erc721PrecompileAddress = "0xaaAAAAAA0001A864000000000000000000000000";

export async function main() {
	const { erc721Precompile, wallet } = getERC721Precompile(
		env.CALLER_PRIVATE_KEY,
		erc721PrecompileAddress,
		COLLECTION_ID
	);
	const bobSigner = getSignerWallet(env.BOB_PRIVATE_KEY);

	const tx = await erc721Precompile.connect(wallet).approve(bobSigner.address, serialNumber);
	await tx.wait();
	const txTransferFrom = await erc721Precompile
		.connect(bobSigner)
		.transferFrom(wallet.address, bobSigner.address, serialNumber);
	const receipt = await txTransferFrom.wait();
	const { event } = (receipt?.events as any)[0];
	const { from, to, tokenId } = (receipt?.events as any)[0].args;
	assert(event === "Transfer", `Incorrect event ${event}`);
	assert(from === wallet.address, `Incorrect from field ${from}`);
	assert(to === bobSigner.address, `Incorrect to field ${to}`);
	assert(tokenId.toString() === serialNumber.toString(), `Incorrect to tokenId ${serialNumber}`);
	console.log(`Completed transferFrom at blockhash ${receipt.blockHash}`);
}

main();
