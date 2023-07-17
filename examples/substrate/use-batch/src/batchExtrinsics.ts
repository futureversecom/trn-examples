import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

export async function main() {
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);

  const calls = new Array(10)
    .fill(1)
    .map((n, i) => api.tx.system.remark(`Call ${n + i}`));
  const extrinsic = api.tx.utility.batch(calls);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [event] = filterExtrinsicEvents(result.events, [
    "Utility.BatchCompleted",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
}

main();
