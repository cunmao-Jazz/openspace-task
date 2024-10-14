// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfase.sol";

contract TokenBank{
    IERC20 public token;
    mapping(address => uint) public balances;

    modifier AccountVerification(address account){
        require(account !=address(0), "Invalid address");
        _;
    }

    modifier AmountVerification(uint256 amount){
        require(amount > 0, "Insufficient funds");
        _;
    }

    constructor(address _tokenaddress) AccountVerification(_tokenaddress){
        token = IERC20(_tokenaddress);
    }



    function deposit(uint256 amount) public AmountVerification(amount) {
        require(token.transferFrom(msg.sender,address(this), amount), "TransferFrom failed");

        balances[msg.sender]+=amount;
    }

    function withdraw(uint256 amount) public AmountVerification(amount) {
        require(balances[msg.sender] >= amount, "Insufficient balance in TokenBank");

        balances[msg.sender]-=amount;


        require(token.transfer(msg.sender, amount),"TransferFrom failed");

    }

    function balanceOf(address account) public view AccountVerification(account) returns(uint256){
        return balances[account];
    }
}