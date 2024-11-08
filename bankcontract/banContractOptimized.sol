// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BankOptimized {

    address private admin;

    mapping(address => uint256) public balances;

    address constant GUARD = address(1);
    mapping(address => address) public _nextDepositor;

    uint256 public listSize;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed admin, uint256 amount);


    constructor(){
        admin = msg.sender;
        _nextDepositor[GUARD] = GUARD;
    }

    function deposit() public payable {
        require(msg.value > 0, "You must send some ETH");

        balances[msg.sender] += msg.value;

        _updataTopbalances(msg.sender);

        emit Deposit(msg.sender,msg.value);

    }

    function _updataTopbalances(address depositor) internal {
        uint256 depositorBalance = balances[depositor];

        if(_nextDepositor[depositor] != address(0)){
            _removeDepositor(depositor);
        }

        address current = GUARD;
        uint256 currentRank = 0;
        bool inserted = false;

        while(_nextDepositor[current] != GUARD && currentRank < 10){
            address next = _nextDepositor[current];
            uint256 nextbalance = balances[next];

            if(depositorBalance > nextbalance){
                _nextDepositor[current] = depositor;
                _nextDepositor[depositor] = next;
                listSize++;
                inserted = true;
                break;
            }
            current = next;
            currentRank++;
        }

        if (!inserted && listSize < 10){
            _nextDepositor[current] = depositor;
            _nextDepositor[depositor] = GUARD;
            listSize++;
        }

        if (listSize > 10){
            current = GUARD;
            for(uint256 i=0;i<9;i++){
                current = _nextDepositor[current];
            }
            address toRemove = _nextDepositor[current];
            _nextDepositor[current] = GUARD;
            _nextDepositor[toRemove] = address(0);
            listSize--;
        }
    }

    function _removeDepositor(address depositor) internal {
        address current = GUARD;

        while(_nextDepositor[current] !=GUARD){
            if(_nextDepositor[current] == depositor){
                _nextDepositor[current] = _nextDepositor[depositor];
                _nextDepositor[depositor] = address(0);
                listSize--;
                break;
            }
            current = _nextDepositor[current];
        }
    }

    function withdraw(uint256 amount) public {
        require(msg.sender == admin, "Permission Denied");
        require(address(this).balance >= amount, "Insufficient funds");

        payable(admin).transfer(amount);

        emit Withdraw(admin, amount);
    }

    function getTopDepositors() public view returns (address[] memory topDepositors) {
        topDepositors = new address[](listSize); 
        address current = _nextDepositor[GUARD];
        uint256 i = 0;

        while (current != GUARD && i < listSize) {
            topDepositors[i] = current;
            current = _nextDepositor[current];
            i++;
        }

        return topDepositors;
    }
}