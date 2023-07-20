import { ApiPromise } from "@polkadot/api";
import type { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { useRootApi } from "@trne/ui-utils/hooks/useRootApi";
import { createExtrinsicPayload } from "@trne/utils/src/createExtrinsicPayload";
import { sendExtrinsicWithSignature } from "@trne/utils/src/sendExtrinsicWithSignature";
import { utils as ethers } from "ethers";
import { useCallback, useState } from "react";

import { useWallet } from "./useWallet";

const ASTO = {
	id: 17508,
	decimals: 18,
};
const target = "0x25451A4de12dcCc2D166922fA938E900fCc4ED24";

type Extrinsic = SubmittableExtrinsic<"promise", ISubmittableResult>;

export const useTransfer = () => {
	const [estimatedGasFee, setEstimatedGasFee] = useState("");
	const [extrinsicId, setExtrinsicId] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const { wallet, ethereum } = useWallet();
	const { rootApi } = useRootApi();

	const submitExtrinsic = useCallback(async () => {
		if (!wallet.accounts || !ethereum) return;

		try {
			setIsLoading(true);
			const address = wallet.accounts[0];
			const assetId = ASTO.id;
			const amount = ethers.parseUnits("100", ASTO.decimals).toString();
			const extrinsic = rootApi?.tx.assets.transfer(assetId, target, amount) as Extrinsic;

			const [payload, ethPayload] = await createExtrinsicPayload(
				rootApi as ApiPromise,
				address,
				extrinsic.method
			);
			console.log("ethPayload:", ethPayload);

			const signature = await ethereum.request({
				method: "personal_sign",
				params: [ethPayload, address],
			});
			console.log("signature:", signature);

			const estimatedFee = await extrinsic.paymentInfo(address);
			setEstimatedGasFee(estimatedFee?.partialFee?.toString());
			console.log(`Estimated Gas Fee: ${estimatedFee?.partialFee?.toString()}`);

			const signedExtrinsic = extrinsic.addSignature(
				address,
				signature as `0x${string}`,
				payload.toPayload()
			) as Extrinsic;

			const result = await sendExtrinsicWithSignature(signedExtrinsic);
			console.log(`Extrinsic Result: `, result);
			setExtrinsicId(result.extrinsicId);
			console.log(`Explorer Link: https://explorer.rootnet.cloud/extrinsic/${result.extrinsicId}`);
			console.log("------------------------");
		} catch (error) {
			console.log("Error:", error);
		} finally {
			await rootApi?.disconnect();
			setIsLoading(false);
		}
	}, [ethereum, rootApi, wallet.accounts]);

	return { submitExtrinsic, isLoading, estimatedGasFee, extrinsicId };
};