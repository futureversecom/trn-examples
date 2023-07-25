/* eslint-disable @typescript-eslint/no-explicit-any */
import { getXrplClient } from "@trne/utils/getXrplClient";
import { withChainApi } from "@trne/utils/withChainApi";
import { cleanEnv, str } from "envalid";
import { convertStringToHex, Payment, Wallet, xrpToDrops } from "xrpl";

const env = cleanEnv(process.env, {
	SECRET_SEED_XRP: str(),
});

withChainApi("porcini", async (api) => {
	const xrplApi = await getXrplClient("wss://s.altnet.rippletest.net:51233");
	// Send xrp to door account, XRPL bridge relayer will bridge it to root network
	const wallet = Wallet.fromSeed(env.SECRET_SEED_XRP);
	console.log("wallet.address", wallet.address);

	const amount = 1;
	const receiver = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const XRP_BRIDGE_ADDRESS = "rnZiKvrWFGi2JfHtLS8kxcqCqVhch6W5k5";
	const request: Payment = {
		TransactionType: "Payment",
		Destination: XRP_BRIDGE_ADDRESS,
		Account: wallet.address,
		Amount: xrpToDrops(amount),
		Memos: [
			{
				Memo: {
					MemoType: convertStringToHex("Address"),
					MemoData: convertStringToHex(receiver),
				},
			},
		],
	};
	const response = await xrplApi.submit(request, { wallet: wallet });
	console.log("Response", response);
	// subscribe to system events via storage
	api.query.system.events((events: any[]) => {
		console.log(`\nReceived ${events.length} event(s):`);

		// loop through the Vec<EventRecord>
		events.forEach((record) => {
			const { event } = record;
			if (event.section === "xrplBridge" && event.method === "TransactionAdded") {
				console.log(`XRPL Bridge transaction added successfully, for event id ${event.data[0]}`);
			}

			if (event.section === "xrplBridge" && event.method === "ProcessingOk") {
				console.log(`XRPL Bridge transaction executed successfully, for event id ${event.data[0]}`);
				api.disconnect().then(() => process.exit(0));
			}

			if (
				event.section === "assets" &&
				event.method === "Issued" &&
				event.data[0].toString() === "2" &&
				event.data[2].toString() === xrpToDrops(amount)
			) {
				console.log(
					`XRPL Bridge transaction executed successfully, for address ${event.data[1].toString()}`
				);
			}
		});
	});
});
