// SPDX-License-Identifier: MIT  #определение лицензии

pragma solidity ^0.8.19;                #версия компилятора

contract SimpleWallet {                #объявление смарт-контракта

   	 mapping(address => uint) public balances;                #создает хранилище для хранения балансов пользователей.

  	  event Deposited(address indexed user, uint amount); #объявляет два события для логирования операций

   	 event Withdrawn(address indexed user, uint amount); #indexed позволяет фильтровать события по адресу пользователя



    // Функция для внесения средств на контракт
    	function deposit() public payable {  #публичная функция, принимающая ETH (модификатор payable)
        	require(msg.value > 0, "Amount must be greater than zero"); #проверяет, что сумма перевода больше нуля
        	balances[msg.sender] += msg.value; #увеличивает баланс отправителя на сумму перевода
        	emit Deposited(msg.sender, msg.value); #генерирует событие о внесении средств
    }

    // Функция для вывода средств с контракта
    	function withdraw(uint amount) public { #публичная функция для вывода указанной суммы
        	require(amount <= balances[msg.sender], "Insufficient balance"); #проверяет, что на балансе достаточно средств
        	balances[msg.sender] -= amount; #уменьшает баланс пользователя
        	payable(msg.sender).transfer(amount); #переводит указанную сумму на кошелек пользователя
        	emit Withdrawn(msg.sender, amount); #генерирует событие о выводе средств
    }

    // Функция для просмотра баланса пользователя
    	function getBalance(address user) public view returns (uint) { #функция только для чтения (view) для проверки баланса
        	return balances[user]; #возвращает баланс указанного пользователя
    }
}
