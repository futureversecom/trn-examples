#!/usr/bin/env bash

forge script \
  ./script/Counter.s.sol:CounterScript \
  --rpc-url $PORCINI_RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --legacy \
  --broadcast \
  --verify \
  --verifier sourcify \
  -vvvv
