"use client";

import Link from "next/link";

import { useTransfer } from "../../lib/hooks/useTransfer";
import { useWallet } from "../../lib/hooks/useWallet";
import { Button } from "./Button";

export default function Demo() {
	const { connectWallet, isConnecting, wallet, ethereum } = useWallet();

	const { submitExtrinsic, isLoading, estimatedGasFee, extrinsicId } = useTransfer();

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
					<br />
					<Button
						type="button"
						variant="small"
						isLoading={isLoading}
						onClick={() => submitExtrinsic()}
					>
						Execute Transfer
					</Button>
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
				</div>
			)}
		</div>
	);
}
