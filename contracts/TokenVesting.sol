// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// this should -
// 1. know the beneficiary & token address
// 2. store vesting params
// 3. receive the tokens from owner 
// 4. calculate how much has already been vested
// 5. let the beneficiary claim

contract TokenVesting {
    // constructor arguments
    address public owner;
    address public beneficiary;
    address public token;
    uint256 public start;
    uint256 public cliffDuration;
    uint256 public duration;
    uint256 public totalAllocation;

    constructor(
        address _beneficiary,
        address _token,
        uint256 _start,
        uint256 _duration,
        uint256 _cliffDuration,
        uint256 _totalAllocation
    ){  
        require(_beneficiary!= address(0), "beneficiary address is 0");
        beneficiary = _beneficiary;

        require(_token != address(0), "token address is 0");
        token = _token;

        start = _start;

        require(duration > 0, "duration is 0");
        duration = _duration;

        require(_cliffDuration < duration, "cliff duration cannot be more than total duration");
        cliffDuration = _cliffDuration;

        require(_totalAllocation > 0);
        totalAllocation = _totalAllocation;

        owner = msg.sender;
    }

    // non-constructor state variables
    uint256 public released;
    bool public funded;

    modifier onlyOwner{
        require (owner == msg.sender, "user is not the owner, action not permitted");
        _;
    }

    function fund() external onlyOwner {

        require(!funded, "already funded");
        
        // transfer already allocated funds from owner to this contract

        funded = true;
    }

    modifier onlyBeneficiary{
        require(msg.sender == beneficiary, "callable only by the beneficiary");
        _;
    }

    function claim() external onlyBeneficiary {

        // this is a full claim of available vesting amount

    }

    function partialClaim(uint256 amount) external onlyBeneficiary {
        
    }

    function vestedAmount() public view returns (uint256){

        // what is the use of this? 
    }

    function claimableAmount() public view returns (uint256){
        
    }

    // should cliff reached be a function or modifier?
    // TODO Dshould I make an interface for token functions? pros/coms?
}