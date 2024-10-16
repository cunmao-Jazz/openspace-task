// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./isContract.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
contract BaseERC20 {

    using Address for address;

    string public name; 
    string public symbol; 
    uint8 public decimals; 

    uint256 public totalSupply; 

    mapping (address => uint256) balances; 

    mapping (address => mapping (address => uint256)) allowances; 

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor()  {
        name = "BaseERC20";
        symbol = "BERC20";
        decimals = 18;
        totalSupply = 100_000_000 * 10 ** uint256(decimals);
        balances[msg.sender] = totalSupply;  
    }

    modifier AddressVerification(address _to){
        require(_to !=address(0), "Invalid address");
        _;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];

    }

    function transfer(address _to, uint256 _value) public AddressVerification(_to) returns (bool success) {
        require(balances[msg.sender] > _value, "ERC20: transfer amount exceeds balance");
        
        balances[msg.sender] -= _value;
        balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);  
        return true;   
    }

    function transferFrom(address _from, address _to, uint256 _value) public AddressVerification(_to) returns (bool success) {
        // write your code here
        require(balances[_from] >= _value, "ERC20: transfer amount exceeds balance");
        require(allowances[_from][msg.sender] >= _value, "ERC20: transfer amount exceeds allowance");

        balances[_from] -= _value;
        balances[_to] +=_value;
        allowances[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value); 
        return true; 
    }

    function transferWithCallback(address recipient, uint256 amount,bytes calldata data) external AddressVerification(recipient) returns(bool){
        require(balances[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");
        require(approve(recipient,amount), "approve failed");
      
       if (recipient.isContract()){
            (bool success,) = recipient.call(
                abi.encodeWithSignature("tokensReceived(address,uint256,bytes)", msg.sender, amount,data)
            );
            
            require(success, "tokensReceived call failed");
       }

       return true;
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        // write your code here
        allowances[msg.sender][_spender] = _value;


        emit Approval(msg.sender, _spender, _value); 
        return true; 
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {   
        // write your code here     
        return allowances[_owner][_spender];
    }
}