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

  const serialId = 0;
  const tokenURI = await erc721Precompile.connect(wallet).tokenURI(serialId);
  console.log("tokenURI:", tokenURI.toString());
  assert(
    tokenURI === "https://example.com/metadata/0",
    `Incorrect name ${tokenURI}`
  );
}

main();
