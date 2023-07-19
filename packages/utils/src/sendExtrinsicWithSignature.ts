import { SubmittableExtrinsic, SubmittableResultValue } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

export interface SubmittableResponse {
	blockHash: string;
	extrinsicHash: string;
	extrinsicIndex: number;
	extrinsicId: string;
}
export async function sendExtrinsicWithSignature(
	extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>
): Promise<SubmittableResponse> {
	return new Promise((resolve, reject) => {
		let unsubscribe: () => void;
		extrinsic
			.send((result) => {
				const { status, dispatchError, txHash, txIndex, blockNumber } =
					result as SubmittableResultValue;
				if (!status.isFinalized) return;

				if (!dispatchError) {
					unsubscribe?.();
					const blockHash = status.asFinalized.toString();
					const height = blockNumber!.toString().padStart(10, "0");
					const index = txIndex!.toString().padStart(6, "0");
					const hash = blockHash.slice(2, 7);
					const extrinsicId = `${height}-${index}-${hash}`;

					return resolve({
						blockHash,
						extrinsicHash: txHash.toString(),
						extrinsicIndex: txIndex!,
						extrinsicId,
					});
				}

				if (!dispatchError.isModule) {
					unsubscribe?.();
					return reject(new Error(`Extrinsic failed ${JSON.stringify(dispatchError.toJSON())}`));
				}

				const { section, name, docs } = dispatchError.registry.findMetaError(
					dispatchError.asModule
				);
				unsubscribe?.();
				reject(new Error(`Extrinsic sending failed, [${section}.${name}] ${docs}`));
			})
			.then((unsub) => (unsubscribe = unsub))
			.catch((error) => reject(error));
	});
}
