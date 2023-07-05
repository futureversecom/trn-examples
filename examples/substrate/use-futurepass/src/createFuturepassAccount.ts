import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const BOB = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
  const api = await getChainApi("local");
  const extrinsic = api.tx.futurepass.create(BOB);
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Futurepass.FuturepassCreated",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
