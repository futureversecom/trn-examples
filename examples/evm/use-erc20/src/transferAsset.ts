import { getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import assert from "assert";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

// Find token details at
// https://explorer.rootnet.cloud/tokens
const XRP_TOKEN_ID = 2;

export async function main() {
	const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
		env.CALLER_PRIVATE_KEY,
		XRP_TOKEN_ID
	);

	const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const amountToTransfer = 100;

	const tx = await erc20Precompile.connect(wallet).transfer(target, amountToTransfer);
	const receipt = await tx.wait();
	console.log("receipt::", receipt);

	const { event } = (receipt?.events as any)[0];
	const { from, to, value } = (receipt?.events as any)[0].args;
	assert(event === "Transfer", `Incorrect event ${event}`);
	assert(from === "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b", `Incorrect from field ${from}`);
	assert(to === "0x25451A4de12dcCc2D166922fA938E900fCc4ED24", `Incorrect to field ${to}`);
	assert(value.toString() === amountToTransfer.toString(), `Incorrect to amount ${value}`);
}

main();
