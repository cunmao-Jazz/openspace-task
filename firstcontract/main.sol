//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Counter {
    uint public counter;

    constructor() {
        counter = 0;
    }

    function get() public view returns (uint) {
        return counter;
    }

    function add(uint x) public {
        counter += x;
    }
}