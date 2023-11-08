// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "../contracts/Counter.sol";

import "forge-std/console.sol";
import "forge-std/Script.sol";

contract CounterScript is Script {
  function setUp() public {}

  function run() public {
    uint256 deployerPrivateKey = vm.envUint("CALLER_PRIVATE_KEY");

    vm.startBroadcast(deployerPrivateKey);
    new Counter(0);
    vm.stopBroadcast();
  }
}
