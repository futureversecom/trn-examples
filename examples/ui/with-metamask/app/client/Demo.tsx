"use client";

import Link from "next/link";
import { SyntheticEvent } from "react";

import { useTransfer } from "../../libs/hooks/useTransfer";
import { useWallet } from "../../libs/hooks/useWallet";
import { Button } from "./Button";

export default function Demo() {
	const { connectWallet, isConnecting, wallet, ethereum } = useWallet();

	const { submitExtrinsic, isLoading, estimatedGasFee, extrinsicId, errorMessage } = useTransfer();

	const handleSubmit = async (event: SyntheticEvent) => {
		event.preventDefault();
		const target = event.target as typeof event.target & {
			targetAddress: { value: `0x${string}` };
		};
		const targetAddress = target.targetAddress.value;
		await submitExtrinsic(targetAddress);
	};

	return (
		<div className="m-3 text-center">
			{ethereum?.isMetaMask && wallet.accounts && wallet.accounts.length < 1 && (
				<Button
					type="button"
					variant="small"
					isLoading={isConnecting}
					onClick={() => connectWallet()}
				>
					Connect MetaMask
				</Button>
			)}

			{wallet.accounts && wallet.accounts.length > 0 && (
				<div>
					<div>
						Connected Account: <span className="font-bold">{wallet.accounts[0]}</span>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="mt-3 form-control w-full">
							<label className="label">
								<span className="label-text">Target account address:</span>
							</label>
							<input
								id="targetAddress"
								name="targetAddress"
								type="text"
								placeholder="0x0123abcd..."
								className="input input-bordered w-full"
								required
								pattern="^0x[a-fA-F0-9]{40}$"
							/>
							<label className="label">
								<span className="label-text-alt">&nbsp;</span>
								<span className="label-text-alt text-neutral-600">
									Ethereum compatible public key
								</span>
							</label>
						</div>
						<br />
						<Button type="submit" variant="small" isLoading={isLoading}>
							Execute Transfer
						</Button>
					</form>
					<br />
					{estimatedGasFee && (
						<div className="mt-6 bg-neutral-800 rounded-md px-4 py-4 ring-1 ring-neutral-900/5 shadow-sm">
							<div className="text-left">
								<p className="font-medium text-white">
									Estimated gas used by tx:
									<span className="ml-3 text-gray-400">{estimatedGasFee}</span>
								</p>
							</div>
						</div>
					)}
					{extrinsicId && (
						<div>
							<br />
							<p className="font-semibold text-white">Extrinsic signed and sent successfully!</p>
							<p className="mt-4 font-semibold text-white">
								<Link
									target="_blank"
									href={`https://explorer.rootnet.cloud/extrinsic/${extrinsicId}`}
									className="text-indigo-600 hover:text-indigo-400"
									rel="noopener noreferrer"
								>
									View on Block Explorer
								</Link>
							</p>
						</div>
					)}
					{errorMessage && (
						<div className="text-left">
							<br />
							<p className="font-medium text-red-400">
								Error encountered when processing the transaction:
							</p>
							<p className="mt-2 bg-neutral-800 rounded-md px-4 py-4 ring-1 ring-neutral-900/5 shadow-sm font-mono text-xs text-gray-400">
								{errorMessage}
							</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
