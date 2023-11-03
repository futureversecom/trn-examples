import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import { getPublicProviderUrl } from "@therootnetwork/api";
import { cleanEnv, str } from "envalid";
import { Wallet } from "ethers";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";

const env = cleanEnv(process.env, {
	CALLER_PRIVATE_KEY: str(),
});

const wallet = new Wallet(env.CALLER_PRIVATE_KEY);

const config: HardhatUserConfig = {
	solidity: {
		version: "0.8.17",
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	networks: {
		porcini: {
			url: getPublicProviderUrl("porcini", false),
			chainId: 7672,
			accounts: [env.CALLER_PRIVATE_KEY],
		},
	},
	namedAccounts: {
		deployer: wallet.address,
	},
};

export default config;
