// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfase.sol";

abstract contract Bank is Ibank {
    address internal admin;
    mapping(address => uint) public balances;
    address[3] public topamount;

    constructor(){
        admin = msg.sender;
    }

    modifier BalanceVerification(uint256 amount){
        require(address(this).balance >= amount, "Insufficient funds");
        _;
    }

    modifier ownerVerification(){
        require(msg.sender == admin, "Permission Denied");
        _;
    }

    modifier senderBalanceVerificatio() virtual{
        require(msg.value > 0, "You must send some ETH");
        _;
    }

    function ownertransfer(address newowner) public virtual;


    function deposit() public payable senderBalanceVerificatio {

        balances[msg.sender] += msg.value;

        updataTopbalances(msg.sender);

    }


    function updataTopbalances(address depositor) internal  {
        uint depositorBalance = balances[depositor];

        for(uint i=0;i<topamount.length;i++){
            if (topamount[i] == address(0)){
                topamount[i] = depositor;
                break;
            }

            if (balances[topamount[i]] < depositorBalance){
                for(uint j=topamount.length - 1; j>i;j--){
                    topamount[j] = topamount[j-1];
                }
                topamount[i] = depositor;
                break ;
            }

        }
    }

    function withdraw(uint256 amount) public ownerVerification BalanceVerification(amount) {
         (bool success, ) = payable(msg.sender).call{value: amount}("");
         require(success, "Transfer failed.");
    }

}

contract Bigbank is Bank{

    modifier senderBalanceVerificatio() override {
    require(msg.value > 0.001 ether, "You must send more than 0.001 ETH");
    _;
}


    function ownertransfer(address newowner) public override ownerVerification{
        admin = newowner;
    }
}