import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getChainApi } from "@trne/utils/getChainApi";
import { ERC20_ABI, getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { utils } from "ethers";
import { getDefaultProvider } from "ethers";

const argv = collectArgs();

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

// This example assumes, there is liquidity pool for paymentAsset[1124] AND XrpAsset (100,000,000,000 & 100,000,000,000)
export async function main() {
	assert("paymentAsset" in argv, "Payment asset ID is required");

	const api = await getChainApi("local");
	const caller = createKeyring(env.CALLER_PRIVATE_KEY);
	const { paymentAsset } = argv as unknown as { paymentAsset: number };
	const { erc20Precompile } = getERC20PrecompileForAssetId(env.CALLER_PRIVATE_KEY, paymentAsset);
	const provider = getDefaultProvider("ws://127.0.0.1:9944");
	const fees = await provider.getFeeData();
	console.log("fees::", fees.maxFeePerGas?.toString());
	const sender = caller.address;
	const value = 0; //eth
	const gasLimit = 22953;
	const maxFeePerGas = fees.maxFeePerGas?.toNumber(); //30001500000000
	const maxPriorityFeePerGas = null;
	const nonce = null;
	const accessList = null;
	const transferAmount = 1;
	const iface = new utils.Interface(ERC20_ABI);
	const BOB = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";
	const encodedInput = iface.encodeFunctionData("transfer", [BOB, transferAmount]);

	const evmCall = api.tx.evm.call(
		sender,
		erc20Precompile.address,
		encodedInput,
		value,
		gasLimit,
		maxFeePerGas,
		maxPriorityFeePerGas,
		nonce,
		accessList
	);

	const maxPayment = 3000150;
	const feeProxiedCall = api.tx.feeProxy.callWithFeePreferences(paymentAsset, maxPayment, evmCall);
	const { result } = await sendExtrinsic(feeProxiedCall, caller, {
		log: console,
	});

	const [proxyEvent, evmEvent] = filterExtrinsicEvents(result.events, [
		"FeeProxy.CallWithFeePreferences",
		// depending on what extrinsic call you have, filter out the right event here
		"Evm.Log",
	]);
	console.log("Extrinsic Result", {
		proxy: proxyEvent.toJSON(),
		evmEvent: evmEvent.toJSON(),
	});

	await api.disconnect();
	process.exit(0);
}

main();
