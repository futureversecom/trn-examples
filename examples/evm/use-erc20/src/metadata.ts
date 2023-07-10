import { cleanEnv, str } from "envalid";
import { getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import assert from "assert";

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

  const name = await erc20Precompile.connect(wallet).name();
  console.log("name:", name.toString());
  assert(name === "XRP", `Incorrect name ${name}`);

  const symbol = await erc20Precompile.connect(wallet).symbol();
  console.log("symbol:", symbol.toString());
  assert(symbol === "XRP", `Incorrect name ${symbol}`);

  const decimals = await erc20Precompile.connect(wallet).decimals();
  console.log("decimals:", decimals.toString());
  assert(decimals === 6, `Incorrect name ${decimals}`);
}

main();
