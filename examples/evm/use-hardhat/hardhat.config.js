require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
      url: "https://porcini.rootnet.app/",
      chainId: 7672,
      accounts: [process.env.DEPLOYER_PK],
    },
  },
  namedAccounts: {
    deployer: process.env.DEPLOYER,
  },
};
