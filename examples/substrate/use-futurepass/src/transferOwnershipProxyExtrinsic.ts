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
  const newOwner = "0x0E17C1a78d2A77298Df58e5956B33376A1B9f4c2";

  const futurepass = (
    await api.query.futurepass.holders(caller.address)
  ).toString();
  // transfer futurepass
  const call = api.tx.futurepass.transferFuturepass(caller.address, newOwner);

  const extrinsic = api.tx.futurepass.proxyExtrinsic(futurepass, call);

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  const [proxyEvent, fpassTransferred] = filterExtrinsicEvents(result.events, [
    "Futurepass.ProxyExecuted",
    "Futurepass.FuturepassTransferred",
  ]);

  console.log("Extrinsic Result", {
    proxy: proxyEvent.toJSON(),
    fpassTransferred: fpassTransferred.toJSON(),
  });

  await api.disconnect();
}

main();
