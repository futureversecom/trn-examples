// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

contract Counter {
    int256 count;

    constructor(int256 _count) {
        count = _count;
    }

    function increment() public {
        count += 1;
    }

    function decrement() public {
        count -= 1;
    }

    function getCount() public view returns (int256) {
        return count;
    }
}
