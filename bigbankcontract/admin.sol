// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfase.sol";

contract Admin {

    address private admin;

    constructor(){
        admin = msg.sender;
    }

    receive() external payable { }

    modifier ownerVerification(){
        require(msg.sender == admin, "Permission Denied");
        _;
    }

    function adminWithdraw(Ibank bank,uint256 amount) public ownerVerification {
        bank.withdraw(amount);
    }
}