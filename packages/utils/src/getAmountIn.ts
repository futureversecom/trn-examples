import { BigNumber } from "ethers";

const GAS_TOKEN_ID = 2;
export async function getAmountIn(
	provider: any,
	estimate: BigNumber,
	feeTokenAssetId: number
): Promise<number> {
	const fees = await provider.getFeeData();
	const txCostXRP = estimate
		.mul(fees.gasPrice!)
		.div(10 ** 12)
		.toNumber();
	const result = await provider.send("dex_getAmountsIn", [
		txCostXRP,
		[feeTokenAssetId, GAS_TOKEN_ID],
	]);
	console.log("result::", result);
	return result.Ok![0];
}
