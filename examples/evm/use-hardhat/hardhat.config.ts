import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import { cleanEnv, str } from "envalid";
import { getPublicProviderUrl } from "@therootnetwork/api";

const env = cleanEnv(process.env, {
  DEPLOYER_PRIVATE_KEY: str(), // private key of deployer account
  DEPLOYER_ADDRESS: str(), // public key/address of deployer account
});

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
      accounts: [env.DEPLOYER_PRIVATE_KEY],
    },
  },
  namedAccounts: {
    deployer: env.DEPLOYER_ADDRESS,
  },
};

export default config;
