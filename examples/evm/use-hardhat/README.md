# Using `hardhat deploy`

This project demonstrates a basic smart contract deployment and verification to TRN Porcini using `hardhat deploy` plugin. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

## Procedure:

1.  Install the necessary packages and Hardhat plugins.

```
yarn install
```

2.  Create an `.env` file and include your private key(s).

```
DEPLOYER_PK={DEPLOYER_PRIVATE_KEY}
DEPLOYER={DEPLOYER_PUBLIC_KEY}
```

3.  Configure the `hardhat.config.js` file.

4.  Create your solidity smart contract(s) under the `<rootDir>/contracts` folder.

5.  Create your test file(s) under the `<rootDir>/test` folder. Then, run the tests using the following command:

```
yarn test
```

6.  Create your deployment script(s) inside `<rootDir>/deploy` folder.

7.  To deploy the smart contracts (all the solidity files from the `<rootDir>/contracts` folder) to the TRN Porcini network, run the following command:

```
yarn deploy:porcini
```

8.  Finally, to verify the deployed smart contract on Sourcify, execute the following command:

```
yarn verify:porcini
```
