import { cleanEnv, str } from "envalid";
import assert from "assert";
import { getERC721Precompile } from "@trne/utils/getERC721PrecompileContract";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const COLLECTION_ID = 105572;

export async function main() {
  const { erc721Precompile, wallet } = getERC721Precompile(
    env.CALLER_PRIVATE_KEY,
    COLLECTION_ID
  );

  const name = await erc721Precompile.connect(wallet).name();
  console.log("name:", name.toString());
  assert(name === "test", `Incorrect name ${name}`);

  const symbol = await erc721Precompile.connect(wallet).symbol();
  console.log("symbol:", symbol.toString());
  assert(symbol === "test", `Incorrect name ${symbol}`);
}

main();
