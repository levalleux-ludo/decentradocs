pragma solidity >=0.5.13 <0.7.0;

contract AddressList
{
    mapping (address => bool) public _addressMap;

    function setWallet(address account) public {
        _addressMap[account]=true;
    }

    function contains(address account) public view returns (bool){
        return _addressMap[account];
    }
}
contract DVSRegistry {
  string public message = 'Hello World';

  mapping(string => address) private _ownerPerDocId;
  mapping(string => string) private _encryptedKeyPerDocId;
  mapping(string => mapping(address => bool)) private _authorizedAddressPerDocId;


  function setMessage(string calldata newMessage) external {
    message = newMessage;
  }

  function docExists(string memory docId) public view returns(bool) {
    address owner = _ownerPerDocId[docId];
    return owner != address(0);
  }

  function registerDoc(string calldata docId, string calldata encryptedKey, address[] calldata authorizedAddresses) external {
    require(!docExists(docId), "a document with this id already exists");
    address owner = msg.sender;
    _ownerPerDocId[docId] = owner;
    _encryptedKeyPerDocId[docId] = encryptedKey;
    for (uint i = 0; i < authorizedAddresses.length; i++) {
      address account = authorizedAddresses[i];
      _authorizedAddressPerDocId[docId][account] = true;
    }
  }

  function getDocumentKey(string calldata docId) external view returns(string memory) {
    require( (msg.sender == _ownerPerDocId[docId]) || _authorizedAddressPerDocId[docId][msg.sender], "not allowed to get the key for this document" );
    return _encryptedKeyPerDocId[docId];
  }

  function setAccess(string memory docId, address[] memory authorizedAddresses, address[] memory deniedAddresses) public {
    require(msg.sender == _ownerPerDocId[docId], "only the owner of the document can change authorisations");
    for (uint i = 0; i < authorizedAddresses.length; i++) {
      address account = authorizedAddresses[i];
      _authorizedAddressPerDocId[docId][account] = true;
    }
    for (uint i = 0; i < deniedAddresses.length; i++) {
      address account = deniedAddresses[i];
      delete _authorizedAddressPerDocId[docId][account];
    }
  }



}
