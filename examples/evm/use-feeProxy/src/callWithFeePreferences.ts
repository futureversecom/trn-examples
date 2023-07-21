import { collectArgs } from "@trne/utils/collectArgs";
import { createKeyring } from "@trne/utils/createKeyring";
import { filterExtrinsicEvents } from "@trne/utils/filterExtrinsicEvents";
import { getAmountIn } from "@trne/utils/getAmountIn";
import { getChainApi } from "@trne/utils/getChainApi";
import { ERC20_ABI, getERC20PrecompileForAssetId } from "@trne/utils/getERC20PrecompileAddress";
import { getEthersProvider } from "@trne/utils/getEthersProvider";
import { sendExtrinsic } from "@trne/utils/sendExtrinsic";
import assert from "assert";
import { cleanEnv, str } from "envalid";
import { Contract, utils, Wallet } from "ethers";

const argv = collectArgs();

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(), // private key of extrinsic caller
});

const FEE_PROXY_ADDRESS = "0x00000000000000000000000000000000000004bb";
export const FEE_PROXY_ABI = [
	"function callWithFeePreferences(address asset, uint128 maxPayment, address target, bytes input)",
];

export async function main() {
	assert("paymentAsset" in argv, "Payment asset ID is required");
	const provider = getEthersProvider("porcini");
	const fees = await provider.getFeeData();
	const { paymentAsset } = argv as unknown as { paymentAsset: number };
	const destination = "0xE04CC55ebEE1cBCE552f250e85c57B70B2E2625b";
	const { erc20Precompile, wallet } = getERC20PrecompileForAssetId(
		env.CALLER_PRIVATE_KEY,
		paymentAsset
	);
	const feeToken = erc20Precompile;
	const transferAmount = 1;
	const iface = new utils.Interface(ERC20_ABI);
	const transferInput = iface.encodeFunctionData("transfer", [destination, transferAmount]);
	const maxFeePaymentInToken = 10000000000;
	const feeProxy = new Contract(FEE_PROXY_ADDRESS, FEE_PROXY_ABI, wallet);
	const gasEstimate = await feeToken.estimateGas.transfer(destination, transferAmount);
	const nonce = await wallet.getTransactionCount();
	const unsignedTx = {
		type: 0,
		from: wallet.address,
		to: FEE_PROXY_ADDRESS,
		nonce: nonce,
		data: feeProxy.interface.encodeFunctionData("callWithFeePreferences", [
			feeToken.address,
			maxFeePaymentInToken,
			feeToken.address,
			transferInput,
		]),
		gasLimit: gasEstimate,
		gasPrice: fees.gasPrice!,
	};

	await wallet.signTransaction(unsignedTx);
	const tx = await wallet.sendTransaction(unsignedTx);
	const receipt = await tx.wait();
	console.log("receipt::", receipt);
	// check updated balances
	const tokenBalanceUpdated = await feeToken.balanceOf(wallet.address);
	console.log("tokenBalanceUpdated::", tokenBalanceUpdated.toString());
}

main();
