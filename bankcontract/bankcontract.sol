// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Bank {
    address private admin;
    mapping(address => uint) public balances;
    address[3] public topamount;

    constructor(){
        admin = msg.sender;
    }

    function deposit() public payable {
        require(msg.value > 0, "You must send some ETH");

        if(balances[msg.sender] == 0){
            balances[msg.sender] = msg.value;
        } else {
            balances[msg.sender] += msg.value;
        }

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

    function withdraw(uint amount) public {
        require(msg.sender == admin, "Permission Denied");
        require(address(this).balance >= amount, "Insufficient funds");

        payable(admin).transfer(amount);

    }

}