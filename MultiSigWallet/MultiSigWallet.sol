// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultiSigWallet{
    struct Transation{
        address to;
        uint256 value;
        bytes data;
    }

    address[] public Owners;
    uint256 public threshold;
    mapping(address => bool) public isOwner;
    mapping(uint256 => Transation) public  proposal;
    mapping (uint256 => uint256) public  confirmations;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;
    uint256 public proposalCount;

    receive() external payable { }

    constructor(address[] memory _owners,uint256 _threshold) payable{
        require(_owners.length >0, "Owners required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");

        for(uint256 i=0;i<_owners.length;i++){
            address owner = _owners[i];
            require(owner != address(0),"Invalid Onwner");
            require(!isOwner[owner], "Owner not unique");

            isOwner[owner] = true;
            Owners.push(owner);
        }

        threshold = _threshold;
    }

    modifier onlyOwner(){
        require(isOwner[msg.sender], "Not an owner");
        _;
    }
    modifier ProposaInspect(uint256 proposalId){
        require(proposalId < proposalCount, "Proposal does not exist");
        _;
    }

    function submitProposal(address to,uint256 value,bytes memory data) public onlyOwner {
        proposal[proposalCount] = Transation(to,value,data);
        confirmations[proposalCount]+= 1;
        isConfirmed[proposalCount][msg.sender] = true;
        proposalCount++;
    }

    function confirmProposal(uint256 proposalId) public onlyOwner ProposaInspect(proposalId) {     
        require(!isConfirmed[proposalId][msg.sender], "Already confirmed by this owner");

        confirmations[proposalId]+= 1;
        isConfirmed[proposalId][msg.sender] = true;
    }

    function executeTransaction(uint256 proposalId) public ProposaInspect(proposalId) {
        require(confirmations[proposalId] >= threshold, "Not enough confirmations");
        Transation storage txn = proposal[proposalId];

        (bool success,) = txn.to.call{value:txn.value}(txn.data);

        require(success, "Transaction failed");

    }
}