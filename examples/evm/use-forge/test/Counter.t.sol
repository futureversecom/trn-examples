// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../contracts/Counter.sol";

contract CounterTest is Test {
    Counter counter;

    function setUp() public {
        counter = new Counter(0);
    }

    function testGetCount() public {
        int value = counter.getCount();
        assertEq(value, 0);
        emit log_int(value);
    }

    function testIncrement() public {
        counter.increment();
        int value = counter.getCount();
        assertEq(value, 1);
        emit log_int(value);
    }

    function testDecrement() public {
        counter.decrement();
        int value = counter.getCount();
        assertEq(value, -1);
        emit log_int(value);
    }
}
