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

	const balance = await erc20Precompile.connect(wallet).balanceOf(wallet.address);
	console.log("balance:", balance.toString());
	assert(
		balance.toNumber() > 0,
		`Balance for ${wallet.address} is less than 0 ${balance.toNumber()}`
	);
}

main();
