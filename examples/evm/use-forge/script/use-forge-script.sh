#!/usr/bin/env bash

forge script \
  ./script/Counter.s.sol:CounterScript \
  --rpc-url "https://porcini.rootnet.app" \
  --private-key $CALLER_PRIVATE_KEY \
  --legacy \
  --broadcast \
  --verify \
  --verifier sourcify \
  -vvvv
