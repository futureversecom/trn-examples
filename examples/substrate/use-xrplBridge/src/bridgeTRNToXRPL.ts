/* eslint-disable @typescript-eslint/no-explicit-any */
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { getCurrentLedgerIndex, getXrplClient } from "@trne/utils/getXrplClient";
import { getTxsInLedger } from "@trne/utils/getXRPTxs";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { sleep } from "@trne/utils/sleep";
import { cleanEnv, str } from "envalid";
import { decodeAccountID, xrpToDrops } from "xrpl";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const XRP_BRIDGE_ADDRESS = "rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5";

export async function main() {
	const api = await getChainApi("porcini");
	const xrplApi = await getXrplClient("wss://s.altnet.rippletest.net:51233");
	const currentLedgerIndex = await getCurrentLedgerIndex(xrplApi);

	const caller = createKeyring(env.CALLER_PRIVATE_KEY);
	const amount = 1;
	const classicXRPAddress = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";
	const recipientAddress = decodeAccountID(classicXRPAddress);
	const extrinsic = api.tx.xrplBridge.withdrawXrp(xrpToDrops(amount), recipientAddress);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["XrplBridge.WithdrawRequest"]);

	console.log("Extrinsic Result", event.toJSON());

	await api.disconnect();
	await sleep(10000);

	const txsOnXRP = await getTxsInLedger(currentLedgerIndex, classicXRPAddress, xrplApi);

	const findTx = txsOnXRP.find(
		(tx: any) =>
			tx.tx.Account === XRP_BRIDGE_ADDRESS &&
			tx.tx.Destination === classicXRPAddress &&
			tx.tx.Amount === xrpToDrops(amount)
	);
	console.log(`Txs bridged on XRP at ${JSON.stringify(findTx.tx)}`);
}

main();
