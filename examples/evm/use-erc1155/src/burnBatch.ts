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

  const initialIssuance1 = 101;
  const initialIssuance2 = 202;
  const serialNumber1 = await createToken(
    erc1155Precompile,
    initialIssuance1,
    wallet
  );
  const serialNumber2 = await createToken(
    erc1155Precompile,
    initialIssuance2,
    wallet
  );

  const burnAmount = 69;
  const tx = await erc1155Precompile
    .connect(wallet)
    .burnBatch(
      wallet.address,
      [serialNumber1, serialNumber2],
      [burnAmount, burnAmount]
    );
  const receipt = await tx.wait();

  const event = (receipt?.events as any)[0].event;
  const { operator, from, to, ids, balances } = (receipt?.events as any)[0]
    .args;

  assert(event === `TransferBatch`, `Incorrect event ${event}`);
  assert(
    from.toString() === wallet.address,
    `Incorrect from ${from.toString()}`
  );
  assert(
    operator.toString() === wallet.address,
    `Incorrect operator ${operator.toString()}`
  );
  assert(
    to.toString() === "0x0000000000000000000000000000000000000000",
    `Incorrect to ${to.toString()}`
  );
  assert(
    ids[0].toNumber() === serialNumber1,
    `Incorrect id0 ${ids[0].toString()}`
  );
  assert(
    ids[1].toNumber() === serialNumber2,
    `Incorrect id1 ${ids[1].toString()}`
  );
  assert(
    balances[0].toNumber() === burnAmount,
    `Incorrect burn balance amount ${balances[0].toString()} for serialNo ${serialNumber1} `
  );
  assert(
    balances[1].toNumber() === burnAmount,
    `Incorrect burn balance amount ${balances[1].toString()} for serialNo ${serialNumber2}`
  );
}

main();
