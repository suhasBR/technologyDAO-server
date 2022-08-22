//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Token is ERC20Capped, Ownable{
    uint256 public currentSupply;

    constructor(uint256 cap) ERC20Capped(cap) ERC20("Techology DAO Points","TDP"){
        
    }

    function mint(address account, uint256 amount) public onlyOwner{
        _mint(account, amount);
        currentSupply += amount;
    }

    function getCurrentCap()public view returns (uint256){
        uint256 currentCap = cap();
        return currentCap;
    }
}