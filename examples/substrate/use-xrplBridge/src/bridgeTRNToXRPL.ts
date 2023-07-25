/* eslint-disable @typescript-eslint/no-explicit-any */
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getCurrentLedgerIndex, getXrplClient } from "@trne/utils/getXrplClient";
import { getTxsInLedger } from "@trne/utils/getXRPTxs";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import { sleep } from "@trne/utils/sleep";
import { withChainApi } from "@trne/utils/withChainApi";
import { decodeAccountID, xrpToDrops } from "xrpl";

const XRP_BRIDGE_ADDRESS = "rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5";

withChainApi("porcini", async (api, caller) => {
	const xrplApi = await getXrplClient("wss://s.altnet.rippletest.net:51233");
	const currentLedgerIndex = await getCurrentLedgerIndex(xrplApi);

	const amount = 1;
	const classicXRPAddress = "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX";
	const recipientAddress = decodeAccountID(classicXRPAddress);
	const extrinsic = api.tx.xrplBridge.withdrawXrp(xrpToDrops(amount), recipientAddress);

	const { result } = await sendExtrinsic(extrinsic, caller, { log: console });
	const [event] = filterExtrinsicEvents(result.events, ["XrplBridge.WithdrawRequest"]);

	console.log("Extrinsic Result", event.toJSON());

	await sleep(10000);

	const txsOnXRP = await getTxsInLedger(currentLedgerIndex, classicXRPAddress, xrplApi);

	const findTx = txsOnXRP.find(
		(tx: any) =>
			tx.tx.Account === XRP_BRIDGE_ADDRESS &&
			tx.tx.Destination === classicXRPAddress &&
			tx.tx.Amount === xrpToDrops(amount)
	);
	console.log(`Txs bridged on XRP at ${JSON.stringify(findTx.tx)}`);
	process.exit(0);
});
