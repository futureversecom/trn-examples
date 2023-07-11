import { cleanEnv, str } from "envalid";
import assert from "assert";
import {
  createToken,
  getERC1155Precompile,
} from "@trne/utils/getERC1155PrecompileContract";

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
  const serialNumber = await createToken(erc1155Precompile, 0, wallet);
  console.log("serialNumber:", serialNumber);
  const initialIssuance = 100;
  // //
  const mintTx = await erc1155Precompile
    .connect(wallet)
    .mint(wallet.address, serialNumber, initialIssuance);
  await mintTx.wait();
  const balance = await erc1155Precompile.balanceOf(
    wallet.address,
    serialNumber
  );
  console.log("balanceOf:::::", balance.toString());
  // Verify balance is correct
  assert(
    balance.toNumber() === initialIssuance,
    `Incorrect balance ${balance} for ${wallet.address}`
  );
}

main();
