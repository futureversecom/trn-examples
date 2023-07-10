#!/usr/bin/env bash

forge create \
  --rpc-url $PORCINI_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy \
  --verify \
  --verifier sourcify \
  contracts/src/Counter.sol:Counter \
  --constructor-args 0