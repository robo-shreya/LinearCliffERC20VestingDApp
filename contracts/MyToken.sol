// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MyToken {
    // constructor arguments
    string public name;
    string public symbol;
    uint8 public decimals;

    // state variables
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
    }

    // functions
    function transferFrom(address from, address to, uint256 value) public {
        
    }

    function approve(address owner, address spender, uint256 value) public {

    }

    function transfer(address to, uint256 amount) public {

    }
}