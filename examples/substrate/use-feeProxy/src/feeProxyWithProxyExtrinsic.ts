import assert from "assert";
import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { cleanEnv, str } from "envalid";

const argv = collectArgs();

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

// This example assumes, there is liquidity pool for paymentAsset AND XrpAsset (100,000,000,000 & 100,000,000,000)
// Also assumes, that the futurepassAddress has payment asset.
export async function main() {
  assert("paymentAsset" in argv, "Payment asset ID is required");

  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);
  const fpassAddress = (
    await api.query.futurepass.holders(caller.address)
  ).toString();
  const { paymentAsset } = argv as unknown as { paymentAsset: number };

  // can be any extrinsic, using `system.remarkWithEvent` for simplicity
  const innerCall = api.tx.system.remarkWithEvent("Hello World");

  const proxyExtrinsic = api.tx.futurepass.proxyExtrinsic(
    fpassAddress,
    innerCall
  );
  const maxPayment = 1000000;
  const feeProxiedCall = api.tx.feeProxy.callWithFeePreferences(
    paymentAsset,
    maxPayment,
    proxyExtrinsic
  );
  const { result } = await sendExtrinsic(feeproxiedCall, caller, {
    log: console,
  });

  const [proxyEvent, remarkEvent] = filterExtrinsicEvents(result.events, [
    "FeeProxy.CallWithFeePreferences",
    // depending on what extrinsic call you have, filter out the right event here
    "System.Remarked",
  ]);
  console.log("Extrinsic Result", {
    proxy: proxyEvent.toJSON(),
    remark: remarkEvent.toJSON(),
  });

  await api.disconnect();
}

main();
