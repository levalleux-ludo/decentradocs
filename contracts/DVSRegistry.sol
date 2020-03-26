pragma solidity >=0.5.13 <0.7.0;

contract AddressList {
    mapping(address => bool) public _addressMap;

    function setWallet(address account) public {
        _addressMap[account] = true;
    }

    function contains(address account) public view returns (bool) {
        return _addressMap[account];
    }
}
contract DVSRegistry {
    string public message = "Hello World";
    address private _owner;
    string public constant PUBLIC_KEY = '00000-00000-00000-00000-00000';

    modifier onlyOwner() {
        require(
            msg.sender == _owner,
            "only contract owner can call this method"
        );
        _;
    }

    mapping(string => address) private _authorPerDocId;
    mapping(string => string) private _encryptedKeyPerDocId;
    mapping(string => mapping(address => bool)) private _authorizedAddressPerDocId;
    mapping(string => address[]) private _authorizedAddressArrayPerDocId;
    mapping(string => uint256) private _subscriptionFeePerDocId;

    event Register(
      address indexed from,
      string docId,
      string key,
      uint256 fee,
      address[] authorized
    );

    event Subscribe(
      address indexed from,
      string docId,
      uint256 amount
    );

    event Withdraw(
      address indexed from,
      address indexed to,
      uint256 amount
    );

    event ChangeFee(
      address indexed from,
      string docId,
      uint256 fee
    );

    event ChangeAuthorized(
      address indexed from,
      string docId,
      address[] authorized
    );

    constructor() public {
        _owner = msg.sender;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function setMessage(string calldata newMessage) external {
        message = newMessage;
    }

    function docExists(string memory docId) public view returns (bool) {
        address author = _authorPerDocId[docId];
        return author != address(0);
    }

    function compareStrings (string memory a, string memory b) internal view returns (bool) {
      return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))) );
    }

    function registerDoc(
        string calldata docId,
        string calldata encryptedKey,
        uint256 subscriptionFee,
        address[] calldata authorizedAddresses
    ) external {
        require(!docExists(docId), "a document with this id already exists");
        address author = msg.sender;
        _authorPerDocId[docId] = author;
        _encryptedKeyPerDocId[docId] = encryptedKey;
        _subscriptionFeePerDocId[docId] = subscriptionFee;
        for (uint256 i = 0; i < authorizedAddresses.length; i++) {
            address account = authorizedAddresses[i];
            _authorizedAddressPerDocId[docId][account] = true;
        }
        _authorizedAddressArrayPerDocId[docId] = authorizedAddresses;
        emit Register(
          msg.sender,
          docId,
          _encryptedKeyPerDocId[docId],
          _subscriptionFeePerDocId[docId],
          _authorizedAddressArrayPerDocId[docId]
        );
    }

    function getDocumentKey(string calldata docId)
        external
        view
        returns (string memory)
    {
      if((msg.sender == _authorPerDocId[docId]) ||
                _authorizedAddressPerDocId[docId][msg.sender] ||
                compareStrings(_encryptedKeyPerDocId[docId], PUBLIC_KEY) ) {
          return _encryptedKeyPerDocId[docId];
        } else {
          return '';
        }
    }

    function getSubscriptionFee(string calldata docId) external view returns (uint256 fee) {
      require(docExists(docId), "this document has not been registered");
      return _subscriptionFeePerDocId[docId];
    }

    function setSubscriptionFee(string calldata docId, uint256 subscriptionFee) external  {
      require(docExists(docId), "this document has not been registered");
        require(
            msg.sender == _authorPerDocId[docId],
            "only the author of the document can change authorisations"
        );
      _subscriptionFeePerDocId[docId] = subscriptionFee;
      emit ChangeFee(
        msg.sender,
        docId,
        _subscriptionFeePerDocId[docId]
      );
    }

    function getAuthor(string calldata docId) external view returns (address) {
      require(docExists(docId), "this document has not been registered");
      return _authorPerDocId[docId];
    }

    function getAuthorizedAccounts(string calldata docId) external view returns (address[] memory) {
      require(docExists(docId), "this document has not been registered");
      return _authorizedAddressArrayPerDocId[docId];
    }

    function setAccess(
        string memory docId,
        address[] memory authorizedAddresses,
        address[] memory deniedAddresses
    ) public {
        require(
            msg.sender == _authorPerDocId[docId],
            "only the author of the document can change authorisations"
        );
        for (uint i = 0; i < authorizedAddresses.length; i++) {
            address account = authorizedAddresses[i];
            _authorizedAddressPerDocId[docId][account] = true;
            addAccount(docId, account);
        }
        for (uint i = 0; i < deniedAddresses.length; i++) {
            address account = deniedAddresses[i];
            delete _authorizedAddressPerDocId[docId][account];
            removeAccount(docId, account);
        }
        emit ChangeAuthorized(
          msg.sender,
          docId,
          _authorizedAddressArrayPerDocId[docId]
        );
    }

    function removeAccount(string memory docId, address account) private {
      address[] storage addresses = _authorizedAddressArrayPerDocId[docId];
      for (uint32 i = 0; i < addresses.length; i++) {
        if (addresses[i] == account) {
          // replace the current value with value (n-1)
          addresses[i] = addresses[addresses.length - 1];
          addresses.pop(); // remove the last item and reduce length by 1
          return;
        }
      }
    }

    function addAccount(string memory docId, address account) private {
      address[] storage addresses = _authorizedAddressArrayPerDocId[docId];
      for (uint32 i = 0; i < addresses.length; i++) {
        if (addresses[i] == account) {
          // already in the array
          return;
        }
      }
      addresses.push(account); // add the account
    }

    function subscribe(string calldata docId) external payable {
        require(
            (msg.sender != _authorPerDocId[docId]) &&
                !_authorizedAddressPerDocId[docId][msg.sender],
            "account has already subscribed to this document"
        );
        require(
            msg.value >= _subscriptionFeePerDocId[docId],
            "not enough fee to subscribe to this document"
        );
        address payable author = address(uint160(_authorPerDocId[docId]));
        author.transfer(_subscriptionFeePerDocId[docId]);
        _authorizedAddressPerDocId[docId][msg.sender] = true;
        addAccount(docId, msg.sender);
        emit Subscribe(
          msg.sender,
          docId,
          msg.value
        );
    }

    function withdraw(uint256 amount, address payable to) external onlyOwner {
        require(
            amount <= address(this).balance,
            "requested amount too high compared to actual balance"
        );
        to.transfer(amount);
        emit Withdraw(
          msg.sender,
          to,
          amount
        );
    }

}
