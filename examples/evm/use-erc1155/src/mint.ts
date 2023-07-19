import { getERC1155Precompile } from "@trne/utils/getERC1155PrecompileContract";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { ethers } from "ethers";

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

	const tokenName = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("MyToken"));
	const maxIssuance = 0;
	const initialIssuance = 100;
	const tx = await erc1155Precompile
		.connect(wallet)
		.createToken(tokenName, initialIssuance, maxIssuance, wallet.address);
	let receipt = await tx.wait();

	let event = (receipt?.events as any)[0].event;
	const serialNumber = (receipt?.events as any)[0].args.serialNumber;
	assert(event === "TokenCreated", `Incorrect event when token created ${event}`);
	assert(serialNumber >= 0, `Incorrect serial number when token created ${serialNumber}`);
	const quantity = 105;
	//
	const mintTx = await erc1155Precompile.connect(wallet).mint(wallet.address, 0, quantity);
	receipt = await mintTx.wait();

	event = (receipt?.events as any)[0].event;
	const { from, to, value } = (receipt?.events as any)[0].args;
	console.log("quantity minted::", value.toString());
	assert(event === "TransferSingle", `Incorrect event ${event}`);
	assert(from === "0x0000000000000000000000000000000000000000", `Incorrect from field ${from}`);
	assert(to === wallet.address, `Incorrect to field ${to}`);
	assert(value.toNumber() >= 0, `Incorrect to quantity ${value.toString()}`);
}

main();
