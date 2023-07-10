# Using `hardhat deploy`

This project demonstrates a basic smart contract deployment and verification to TRN Porcini using `hardhat deploy` plugin. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

## Procedure:

1.  Install the necessary packages and Hardhat plugins.

    ```
    pnpm install
    ```

2.  Run the commands below to your terminal:

    ```
    export DEPLOYER_PRIVATE_KEY={DEPLOYER_PRIVATE_KEY}
    export DEPLOYER_ADDRESS={DEPLOYER_ADDRESS}
    ```

    Note:
    Replace the placeholders such as `{DEPLOYER_PRIVATE_KEY}`, and `{DEPLOYER_ADDRESS}` with the appropriate values according to your specific setup.

3.  Configure the `hardhat.config.js` file.

4.  Create your solidity smart contract(s) under the `<rootDir>/contracts` folder.

5.  Create your test file(s) under the `<rootDir>/test` folder. Then, run the tests using the following command:

    ```
    pnpm test
    ```

6.  Create your deployment script(s) inside `<rootDir>/deploy` folder.

7.  To deploy the smart contracts (all the solidity files from the `<rootDir>/contracts` folder) to the TRN Porcini network, run the following command:

    ```
    pnpm deploy:porcini
    ```

8.  Finally, to verify the deployed smart contract on Sourcify, execute the following command:

    ```
    pnpm verify:porcini
    ```
