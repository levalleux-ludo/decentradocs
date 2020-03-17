pragma solidity >=0.5.13 <0.7.0;

contract DVSRegistry {
  string public message = 'Hello World';

  function setMessage(string calldata newMessage) external {
    message = newMessage;
  }

}
