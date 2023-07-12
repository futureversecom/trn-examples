import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { cleanEnv, str } from "envalid";
import {
  getCurrentLedgerIndex,
  getXrplClient,
} from "@trne/utils/getXrplClient";
import { decodeAccountID, xrpToDrops } from "xrpl";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { getTxsInLedger } from "@trne/utils/getXRPTxs";

const env = cleanEnv(process.env, {
  CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});
const XRP_BRIDGE_ADDRESS = "rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5";
export async function main() {
  const xrplApi = await getXrplClient("wss://s.altnet.rippletest.net:51233");
  const currentLedgerIndex = await getCurrentLedgerIndex(xrplApi);
  const api = await getChainApi("porcini");
  const caller = createKeyring(env.CALLER_PRIVATE_KEY);
  const amount = 1;
  const classicXRPAddress = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";
  const recipientAddress = decodeAccountID(classicXRPAddress);
  const extrinsic = api.tx.xrplBridge.withdrawXrp(
    xrpToDrops(amount),
    recipientAddress
  );

  const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
  console.log("result:", result);
  const [event] = filterExtrinsicEvents(result.events, [
    "XrplBridge.WithdrawRequest",
  ]);

  console.log("Extrinsic Result", event.toJSON());

  await api.disconnect();
  await timer(10000);

  const txsOnXRP = await getTxsInLedger(
    currentLedgerIndex,
    classicXRPAddress,
    xrplApi
  );

  const findTx = txsOnXRP.find(
    (tx: any) =>
      tx.tx.Account === XRP_BRIDGE_ADDRESS &&
      tx.tx.Destination === classicXRPAddress &&
      tx.tx.Amount === xrpToDrops(amount)
  );
  console.log(`Txs bridged on XRP at ${JSON.stringify(findTx.tx)}`);
  process.exit(0);
}

main();

export const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));
