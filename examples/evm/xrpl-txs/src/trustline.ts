import {cleanEnv, str} from "envalid";
import {Client, Wallet} from "xrpl";
const env = cleanEnv(process.env, {
    CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
    amount: str(),
    currency: str(),
    issuer: str(),
});



//withEthersProvider("porcini", async (provider, wallet, logger) => {
async function main() {
    const testnet = "wss://s.altnet.rippletest.net:51233";
    const xrplClient = new Client(testnet);
    await xrplClient.connect();
    console.log("env.CALLER_PRIVATE_KEY::",env.CALLER_PRIVATE_KEY);
    const wallet = Wallet.fromSeed(env.CALLER_PRIVATE_KEY);
    console.log("Wallet address::", wallet.address);
    const trustSet = {
        "TransactionType": "TrustSet",
        "Account": wallet.address,
        "LimitAmount": {
            "currency": env.currency,
            "value": env.amount,
            "issuer": env.issuer
        },
    }
    const trustSetTx = await xrplClient.autofill(trustSet);
    const response = await xrplClient.submit(trustSetTx, {wallet: wallet});
    console.log('Response:', response);
    process.exit(0);
}
main();
