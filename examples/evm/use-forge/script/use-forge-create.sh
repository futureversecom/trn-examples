#!/usr/bin/env bash

forge create \
  --rpc-url "https://porcini.rootnet.app" \
  --private-key $CALLER_PRIVATE_KEY \
  --legacy \
  --verify \
  --verifier sourcify contracts/Counter.sol:Counter \
  --constructor-args 0