import { cleanEnv, str } from "envalid";
import {
  createToken,
  getERC1155Precompile,
} from "@trne/utils/getERC1155PrecompileContract";
import assert from "assert";

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
  const serialNumber1 = await createToken(erc1155Precompile, 0, wallet);
  const serialNumber2 = await createToken(erc1155Precompile, 0, wallet);

  const initialIssuance1 = 101;
  const initialIssuance2 = 202;
  const receiverAddress = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";

  const mintTx = await erc1155Precompile
    .connect(wallet)
    .mintBatch(
      receiverAddress,
      [serialNumber1, serialNumber2],
      [initialIssuance1, initialIssuance2]
    );
  const receipt = await mintTx.wait();

  const bal1 = await erc1155Precompile.balanceOf(
    receiverAddress,
    serialNumber1
  );
  const bal2 = await erc1155Precompile.balanceOf(
    receiverAddress,
    serialNumber2
  );
  assert(
    bal1.toNumber() === initialIssuance1,
    `Incorrect balance in receiver address after mint ${bal1}`
  );
  assert(
    bal2.toNumber() === initialIssuance2,
    `Incorrect balance in receiver address after mint ${bal2}`
  );

  const event = (receipt?.events as any)[0].event;
  const { from, to, operator, ids, balances } = (receipt?.events as any)[0]
    .args;

  assert(event === "TransferBatch", `Incorrect event ${event}`);
  assert(
    from === "0x0000000000000000000000000000000000000000",
    `Incorrect from field ${from}`
  );
  assert(to === receiverAddress, `Incorrect to field ${to}`);
  assert(
    operator === wallet.address,
    `Incorrect operator ${operator.toString()}`
  );
  assert(
    ids[0].toString() === serialNumber1.toString(),
    `Incorrect ids field ${ids[0]}`
  );
  assert(
    ids[1].toString() === serialNumber2.toString(),
    `Incorrect ids field ${ids[1]}`
  );
  assert(
    balances[0].toString() === initialIssuance1.toString(),
    `Incorrect balances field ${
      balances[0]
    } expected ${initialIssuance1.toString()}`
  );
  assert(
    balances[1].toString() === initialIssuance2.toString(),
    `Incorrect balances field ${
      balances[1]
    } expected ${initialIssuance2.toString()} `
  );
}

main();
