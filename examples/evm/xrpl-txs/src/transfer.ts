import {cleanEnv, str} from "envalid";
import {convertStringToHex, Client, Wallet} from "xrpl";
const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
	destination: str(),
	amount: str(),
	currency: str(),
	issuer: str(),
	trnAddress: str()
});



//withEthersProvider("porcini", async (provider, wallet, logger) => {
async function main() {
	const testnet = "wss://s.altnet.rippletest.net:51233";
	const xrplClient = new Client(testnet);
	await xrplClient.connect();
	console.log("env.CALLER_PRIVATE_KEY::",env.CALLER_PRIVATE_KEY);
	const wallet = Wallet.fromSeed(env.CALLER_PRIVATE_KEY); //rJNQZkUyvhjnCQexQE4m8qdPJUhPcmNWLD
	console.log("Wallet address::", wallet.address);
	const transfer = {
		"TransactionType": "Payment",
		"Account": wallet.address,
		"Destination": env.destination,
		"Amount": {
			"currency": env.currency,
			"value": env.amount,
			"issuer": env.issuer
		},
		"LastLedgerSequence": null,
		"SourceTag":38887387,
		Memos: [
			{
				Memo: {
					MemoType: convertStringToHex("Address"),
					MemoData: convertStringToHex(env.trnAddress),
				},
			},
		],
		"Fee": "10",
	}
	const transferTx = await xrplClient.autofill(transfer);
	const response = await xrplClient.submit(transferTx, {wallet: wallet});
	console.log('Response:', response);
    process.exit(0);
}
main();
