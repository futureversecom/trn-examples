import {
	AddressOrPair,
	SignerOptions,
	SubmittableExtrinsic,
	SubmittableResultValue,
} from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";

export interface SubmittableResponse {
	blockHash: string;
	extrinsicHash: string;
	extrinsicIndex: number;
	extrinsicId: string;
	result: SubmittableResultValue;
}

type SubmitOptions = Partial<SignerOptions> & {
	log?: { info: (msg: string) => void };
};

/**
 * A simple wrapper for `extrisinc.signAndSend` that resolve when the
 * extrinsic is InBlock
 *
 * @param extrinsic - A submitable extrinsic form ApiProimse type
 * @param signer - A keyring pair to sign the extrinsic
 * @param options - Options for Siger when signing the extrisinc
 * @returns - A simple object of SubmittableResponse
 */
export async function sendExtrinsic(
	extrinsic: SubmittableExtrinsic<"promise", ISubmittableResult>,
	signer: AddressOrPair,
	options: SubmitOptions = {}
): Promise<SubmittableResponse> {
	return new Promise((resolve, reject) => {
		let unsubscribe: () => void;
		const { log, ...signerOptions } = options;
		extrinsic
			.signAndSend(signer, signerOptions, (result) => {
				const { status, dispatchError, txHash, txIndex, blockNumber } =
					result as SubmittableResultValue;
				log?.info(`extrinsic status="${status.type}"`);
				if (!status.isFinalized) return;
				if (!txIndex || !blockNumber) return;

				if (!dispatchError) {
					unsubscribe?.();
					const blockHash = status.asFinalized.toString();
					const height = blockNumber.toString().padStart(10, "0");
					const index = txIndex.toString().padStart(6, "0");
					const hash = blockHash.slice(2, 7);
					const extrinsicId = `${height}-${index}-${hash}`;

					return resolve({
						blockHash,
						extrinsicHash: txHash.toString(),
						extrinsicIndex: txIndex,
						extrinsicId,
						result,
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
