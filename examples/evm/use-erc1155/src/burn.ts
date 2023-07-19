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
	const burnAmount = 69;
	const tx = await erc1155Precompile.connect(wallet).burn(wallet.address, serialNumber, burnAmount);
	const receipt = await tx.wait();
	const event = (receipt?.events as any)[0].event;
	const { operator, from, to, id, value } = (receipt?.events as any)[0].args;

	assert(event === `TransferSingle`, `Incorrect event ${event}`);
	assert(from.toString() === wallet.address, `Incorrectly from ${from.toString()}`);
	assert(operator.toString() === wallet.address, `Incorrectly operator ${operator.toString()}`);
	assert(
		to.toString() === "0x0000000000000000000000000000000000000000",
		`Incorrectly to ${to.toString()}`
	);
	assert(id.toNumber() === serialNumber, `Incorrectly id ${id.toString()}`);
	assert(value.toNumber() === burnAmount, `Incorrectly id ${id.toString()}`);
}

main();
