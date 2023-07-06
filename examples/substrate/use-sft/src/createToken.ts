import assert from "assert";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";
import { collectArgs } from "@trne/utils/collectArgs";

const argv = collectArgs();

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  assert("collectionId" in argv, "Collection ID is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const tokenName = "MyToken";
  const initialIssuance = 10;
  const maxIssuance = 1000;
  const tokenOwner = caller.address;
  const { collectionId } = argv as unknown as { collectionId: number };

  const extrinsic = api.tx.sft.createToken(
    collectionId,
    tokenName,
    initialIssuance,
    maxIssuance,
    tokenOwner
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, ["Sft.TokenCreate"]);

  console.log("Extrinsic Result", event.toJSON());

  const tokenId = (
    event.toJSON() as {
      event: {
        data: [[number, number]];
      };
    }
  ).event.data[0];
  console.log("Token ID", tokenId);

  await api.disconnect();
}

main();
