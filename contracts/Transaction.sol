pragma solidity >=0.4.21 <0.7.0;

contract Transaction {
    struct User {
        string firstName;
        string lastName;
        string userAddress;
        uint256 value; // store the smallest value (cents) *$1 = 100
    }

    // mapping from owner wallet address to the user account
    mapping(address => User) userList;

    // store all added wallet addresses
    address[] public userAccounts;

    // create events for each function for logging service
    event AddUser(address from, string firstName, string lastName, string userAddress, uint256 value);

    event AddValue(address from, string firstName, string lastName, uint256 value, uint valueAdded);

    event EditInfo(address from, string firstName, string lastName, string userAddress);

    // add user to contract
    function addUser(string memory firstName, string memory lastName, string memory userAddress) public {
        User memory newUser = User(firstName, lastName, userAddress, 0);
        userList[msg.sender] = newUser;
        userAccounts.push(msg.sender);
        emit AddUser(msg.sender, firstName, lastName, userAddress, 0);
    }

    // get the total user count
    function countUsers() public view returns (uint256 count) {
        return userAccounts.length;
    }

    // retrieve a user detail
    function getUser(address _address) public view returns (
        string memory,
        string memory, string memory,
        uint256
        ) {
            return (
                userList[_address].firstName,
                userList[_address].lastName,
                userList[_address].userAddress,
                userList[_address].value
                );
    }

    // retrieve all user wallet addresses
    function getAllUsers() public view returns (address[] memory) {
        return userAccounts;
    }

    // update an user infomation
    function editInfo(string memory firstName, string memory lastName, string memory userAddress) public {
        userList[msg.sender].firstName = firstName;
        userList[msg.sender].lastName = lastName;
        userList[msg.sender].userAddress = userAddress;
        emit EditInfo(msg.sender, firstName, lastName, userAddress);
    }

    // add value to the added user
    function addValue(uint256 value) public {
        userList[msg.sender].value += value;
        emit AddValue(msg.sender, userList[msg.sender].firstName, userList[msg.sender].lastName, userList[msg.sender].value, value);
    }
}