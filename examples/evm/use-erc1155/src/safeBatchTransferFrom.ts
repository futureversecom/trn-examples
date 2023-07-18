import {
	createToken,
	getERC1155Precompile,
	getSignerWallet,
} from "@trne/utils/getERC1155PrecompileContract";
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

	const initialIssuance1 = 101;
	const initialIssuance2 = 202;
	const serialNumber1 = await createToken(erc1155Precompile, initialIssuance1, wallet);
	const serialNumber2 = await createToken(erc1155Precompile, initialIssuance2, wallet);

	const transferAmount1 = 69;
	const transferAmount2 = 71;
	const callData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("data"));
	const tx = await erc1155Precompile.safeBatchTransferFrom(
		wallet.address,
		bobSigner.address,
		[serialNumber1, serialNumber2],
		[transferAmount1, transferAmount2],
		callData
	);
	const receipt = await tx.wait();

	const { event } = (receipt?.events as any)[0];
	const { from, to, ids, balances, operator } = (receipt?.events as any)[0].args;
	console.log("Event:", event);
	assert(event === "TransferBatch", `Incorrect event ${event}`);
	assert(from === wallet.address, `Incorrect from field ${from}`);
	assert(operator === wallet.address, `Incorrect to field ${operator}`);
	assert(to === bobSigner.address, `Incorrect from field ${to}`);
	assert(
		ids[0].toString() === serialNumber1.toString(),
		`Incorrect to tokenId ${ids[0].toString()}`
	);
	assert(
		ids[1].toString() === serialNumber2.toString(),
		`Incorrect to tokenId ${ids[1].toString()}`
	);
	assert(
		balances[0].toString() === transferAmount1.toString(),
		`Incorrect to tokenId ${balances[0].toString()}`
	);
	assert(
		balances[1].toString() === transferAmount2.toString(),
		`Incorrect to tokenId ${balances[1].toString()}`
	);
}

main();
