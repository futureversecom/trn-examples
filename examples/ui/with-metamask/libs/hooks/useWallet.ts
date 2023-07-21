/* eslint-disable @typescript-eslint/no-explicit-any */
import detectEthereumProvider from "@metamask/detect-provider";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { Maybe } from "@metamask/providers/dist/utils";
import { getPublicProvider } from "@therootnetwork/api";
import { useCallback, useEffect, useMemo, useState } from "react";

interface MetaMaskEthereumProvider {
	isMetaMask?: boolean;
	once(eventName: string | symbol, listener: (...args: any[]) => void): this;
	on(eventName: string | symbol, listener: (...args: any[]) => void): this;
	off(eventName: string | symbol, listener: (...args: any[]) => void): this;
	addListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
	removeListener(eventName: string | symbol, listener: (...args: any[]) => void): this;
	removeAllListeners(event?: string | symbol): this;
}

const CHAIN_INFO = {
	chainId: "0x1df8",
	chainName: "The Root Network Porcini",
	rpcUrls: [getPublicProvider("porcini")],
	nativeCurrency: {
		name: "XRP",
		symbol: "XRP",
		decimals: 18,
	},
};

export const useWallet = () => {
	const [provider, setProvider] = useState<MetaMaskEthereumProvider | null>();
	const [ethereum, setEthereum] = useState<MetaMaskInpageProvider>();
	const [isConnecting, setIsConnecting] = useState(false);
	const [hasProvider, setHasProvider] = useState(false);
	const initialState = useMemo(
		() => ({
			accounts: [],
		}),
		[]
	);
	const [wallet, setWallet] = useState<{ accounts: Maybe<any[]> }>({
		accounts: [],
	});

	const updateWallet = (accounts: Maybe<any[]>) => {
		setWallet({ accounts });
	};

	const refreshAccounts = useCallback(
		(accounts: any) => {
			if (accounts.length > 0) {
				updateWallet(accounts);
			} else {
				// if length 0, user is disconnected
				setWallet(initialState);
			}
		},
		[initialState]
	);

	const getProvider = useCallback(async () => {
		const provider = await detectEthereumProvider({ silent: true });
		setProvider(provider);
		setHasProvider(!!provider); // transform provider to true or false

		if (provider) {
			// request access to the account via MetaMask
			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});
			refreshAccounts(accounts);
			window.ethereum.on("accountsChanged", refreshAccounts);
		}
	}, [refreshAccounts]);

	useEffect(() => {
		getProvider();

		setEthereum(window.ethereum);

		return () => {
			window.ethereum?.removeListener("accountsChanged", refreshAccounts);
		};
	}, [getProvider, initialState, refreshAccounts, setHasProvider]);

	const handleConnect = useCallback(async () => {
		const accounts: Maybe<any[]> = await window.ethereum.request({
			method: "eth_requestAccounts",
		});
		updateWallet(accounts);
	}, []);

	const switchToChain = async () => {
		// switch to (or add) TRN Porcini network
		try {
			await window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: CHAIN_INFO.chainId }],
			});
		} catch (switchError: unknown) {
			const { code } = switchError as { code: number };
			// This error code indicates that the chain has not been added to MetaMask.
			if (code === 4902) {
				try {
					await window.ethereum.request({
						method: "wallet_addEthereumChain",
						params: [CHAIN_INFO],
					});
				} catch (addError) {
					// handle "add" error
					console.log(addError);
				}
			}
			// handle other "switch" errors
			console.log(switchError);
		}
	};

	const connectWallet = useCallback(async () => {
		if (!window.ethereum) return;
		try {
			setIsConnecting(true);
			await handleConnect();
			await switchToChain();
		} catch (error) {
			console.log(error);
		} finally {
			setIsConnecting(false);
		}
	}, [handleConnect]);

	return {
		connectWallet,
		isConnecting,
		wallet,
		provider,
		hasProvider,
		ethereum,
	};
};
