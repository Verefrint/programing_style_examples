// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SimpleShowcase {
    // Храним число в состоянии контракта (state)
    uint256 public stored;

    // -------- pure --------
    // Pure: НЕ читает и НЕ меняет состояние, просто считает
    function add(uint256 a, uint256 b) external pure returns (uint256) {
        return a + b;
    }

    // -------- view --------
    // View: читает состояние, но НЕ меняет его
    function getStored() external view returns (uint256) {
        return stored;
    }

    // -------- payable --------
    // Payable: может принимать ETH, и при этом мы меняем состояние
    function depositAndStore(uint256 newValue) external payable {
        require(msg.value > 0, "Send some ETH");
        stored = newValue;
    }

    // View-функция, которая показывает баланс контракта
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Контракт может принимать ETH напрямую (без вызова функции)
    receive() external payable {}
}
