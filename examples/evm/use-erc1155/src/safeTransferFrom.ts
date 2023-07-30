import { createToken, getERC1155Precompile } from "@trne/utils/getERC1155PrecompileContract";
import { getSignerWallet } from "@trne/utils/getSignerWallet";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { ethers } from "ethers";

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

	const initialIssuance = 100;

	const serialNumber = await createToken(erc1155Precompile, initialIssuance, wallet);

	const tx = await erc1155Precompile.setApprovalForAll(bobSigner.address, true);
	await tx.wait();

	const transferAmount = 69;
	const callData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("data"));
	const tx2 = await erc1155Precompile
		.connect(bobSigner)
		.safeTransferFrom(wallet.address, bobSigner.address, serialNumber, transferAmount, callData);
	const receipt = await tx2.wait();

	const { event } = (receipt?.events as any)[0];
	const { from, to, id, value, operator } = (receipt?.events as any)[0].args;
	console.log("Event:", event);
	assert(event === "TransferSingle", `Incorrect event ${event}`);
	assert(from === wallet.address, `Incorrect from field ${from}`);
	assert(operator === wallet.address, `Incorrect to field ${operator}`);
	assert(to === bobSigner.address, `Incorrect from field ${to}`);
	assert(id.toString() === serialNumber.toString(), `Incorrect to tokenId ${id.toString()}`);
	assert(
		value.toString() === transferAmount.toString(),
		`Incorrect to tokenId ${value.toString()}`
	);
}

main();
