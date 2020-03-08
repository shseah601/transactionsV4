var Web3 = require('web3');
var TruffleContract = require('truffle-contract');

App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  path: '',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: async function() {
    await $.getJSON("Transaction.json", function(transaction) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Transaction = TruffleContract(transaction);
      // Connect provider to interact with contract
      App.contracts.Transaction.setProvider(App.web3Provider);

      return App.initEventWatch();
    });
  },

  initEventWatch: function() {
    var eventName;
    var data

    App.contracts.Transaction.deployed().then( function (instance) {
      instance.allEvents().on('data', function (result) {
        if(result) {
          eventName = result.event;
          data = result.args;
          switch(eventName) {
            case "AddUser":
              console.log("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Event: New Account")
              break;
            case "AddValue":
              console.log("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Dollar Changed: " + (parseFloat(data.valueAdded) / 100).toFixed(2) + " | Event: Change Value")
              break;
            case "EditInfo":
              console.log("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Event: Edit Info")
              break;
          }
        }
      }).on('error', function(error) {
        if(error) {
          console.warn(error)
        }
      });
    });

    return App.getAccount();
  },

  getAccount: function() {
    setInterval(function() {
      web3.eth.getCoinbase(function(err, account) {
        if (err === null && App.account !== account) {
          // console.log('account change detected')
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
          App.path = $(location).attr('pathname');
          switch(App.path) {
            case '/':
              return App.render();
            case '/addValue.html':
              return App.renderAddValue();
            case '/editInfo.html':
              return App.renderEditInfo();
            case '/userInfo.html':
              return App.renderUserInfo();
            case '/addUser.html':
              return App.renderAddUser();
          }
        }
      });
    },100);
  },

  render: function() {
    console.log('render main')
    var txInstance;
    var loader = $("#loader");
    var content = $("#content");
    var addUserNavigate = $('#addUserNavigate');
    var isAdded = $('.isAdded');

    loader.show();
    content.hide();
    addUserNavigate.hide()
    
    // Load contract data
    App.contracts.Transaction.deployed().then(function(instance) {
      txInstance = instance;
      return txInstance.getUser(App.account)
    }).then(function(user) {
      if(user[0] != '' && user[1] != '' && user[2] != ''){
        addUserNavigate.hide();
        isAdded.show();
      } else {
        addUserNavigate.show();
        isAdded.hide();
      }
      return txInstance.getAllUsers();
    }).then(async function(users) {
      var userList = $("#userList");
      userList.empty();

      for (var i = 0; i < users.length; i++) {
        await txInstance.getUser(users[i]).then(function(user) {
          var firstName = user[0];
          var lastName = user[1];
          var userAddress = user[2];
          var value = (parseFloat(user[3]) / 100).toFixed(2);

          // Render user Result
          var userTemplate = "<tr><th>" + (i+1) + "</th><td>" + firstName + "</td><td>" + lastName + "</td><td>" + userAddress + "</td><td>" + value + "</td></tr>"
          userList.append(userTemplate);
        });
      }

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  renderAddValue: function() {
    console.log('render addValue')
    var txInstance;
    var loader = $("#loader");
    var content = $("#content");
    var messageDisplay = $("#messageDisplay");
    var isAdded = $(".isAdded");

    loader.show();
    content.hide();
    messageDisplay.hide();

    // Load contract data
    App.contracts.Transaction.deployed().then(function(instance) {
      txInstance = instance;
      return txInstance.getUser(App.account)
    }).then(function(user) {
      if(user[0] != '' && user[1] != '' && user[2] != ''){
        isAdded.show();
      } else {
        isAdded.hide();
        window.location.replace("/");
      }
      return txInstance.getUser(App.account);
    }).then(function(user) {
      $("#userValue").html("Current Dollar: $ " + (parseFloat(user[3]) / 100).toFixed(2));
      $('#valueAdd').change(function () {
        $(this).val(parseFloat($(this).val()).toFixed(2));
      });
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  renderEditInfo: function() {
    console.log('render editInfo')
    var txInstance;
    var loader = $("#loader");
    var content = $("#content");
    var messageDisplay = $("#messageDisplay");
    var isAdded = $(".isAdded");
    
    loader.show();
    content.hide();
    messageDisplay.hide();
    App.contracts.Transaction.deployed().then(function(instance) {
      txInstance = instance;
      return txInstance.getUser(App.account)
    }).then(function(user) {
      var firstName = user[0];
      var lastName = user[1];
      var userAddress = user[2];
      var value = user[3];
      if(user[0] != '' && user[1] != '' && user[2] != ''){
        isAdded.show();
      } else {
        isAdded.hide();
        window.location.replace("/");
      }

      $('#firstName').val(firstName);
      $('#lastName').val(lastName);
      $('#userAddress').val(userAddress);

    });
    loader.hide();
    content.show();
  },

  renderUserInfo: function() {
    console.log('render userInfo')
    var txInstance;
    var loader = $("#loader");
    var content = $("#content");
    var userEditBtn = $('#userEditBtn');
    var isAdded = $('.isAdded');

    loader.show();
    content.hide();
    userEditBtn.attr("disabled", false);
    
    // Load contract data
    App.contracts.Transaction.deployed().then(function(instance) {
      txInstance = instance;
      return txInstance.getUser(App.account)
    }).then(function(user) {
      var firstName = user[0];
      var lastName = user[1];
      var userAddress = user[2];
      var value = user[3];
      if(firstName != '' && lastName != '' && userAddress != ''){
        isAdded.show();
      } else {
        isAdded.hide();
        window.location.replace("/");
      }
      $('#firstName').html(firstName);
      $('#lastName').html(lastName);
      $('#userAddress').html(userAddress);
      $('#value').html((parseFloat(value) / 100).toFixed(2));

      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  renderAddUser: function() {
    console.log('render addUser')
    var txInstance;
    var loader = $("#loader");
    var content = $("#content");
    var messageDisplay = $("#messageDisplay");
    var isAdded = $(".isAdded");

    loader.show();
    content.hide();
    messageDisplay.hide();
    App.contracts.Transaction.deployed().then(function(instance) {
      txInstance = instance;
      return txInstance.getUser(App.account)
    }).then(function(user) {
      if(user[0] != '' && user[1] != '' && user[2] != ''){
        isAdded.show();
        window.location.replace("/");
      } else {
        isAdded.hide();
      }
    });
    loader.hide();
    content.show();
  },

  addUser: function() {
    var userAddBtn = $('#userAddBtn');
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var userAddress = $('#userAddress').val();
    var value = 0;
    var messageDisplay = $('#messageDisplay');

    if(!firstName && !lastName && !userAddress) {
      $('#message').html('Invalid Data');
      messageDisplay.show();
      userAddBtn.attr("disabled", false);
      setTimeout(function() {
        messageDisplay.hide();
      }, 3000)
      return;
    }
    userAddBtn.attr("disabled", true);
    
    App.contracts.Transaction.deployed().then(function (instance) {
      return instance.addUser.sendTransaction(firstName, lastName, userAddress, {from: App.account});
    }).then(function() {
      $('#message').html('Hi, ' + firstName + '. Your account has been created. Redirecting you to homepage in 3 seconds.');
      $('#addUserForm')[0].reset();
      messageDisplay.show();
      setTimeout(function() {
        messageDisplay.hide();
        window.location.replace("/");
      }, 5000)
    }).catch(function(err) {
      if (err.code == 4001) {
        $('#message').html('User creation failed due to transaction rejetion.');
        userAddBtn.attr("disabled", false);
        messageDisplay.show();
        setTimeout(function() {
          messageDisplay.hide();
        }, 3000)
      }
    });
  },

  addValue: function() {
    var txInstance;
    var value = $('#valueAdd').val();
    var valueForContract = parseFloat(value) * 100
    var valueAddBtn = $("#valueAddBtn");
    var messageDisplay = $('#messageDisplay');
    var addValueForm = $('#addValueForm');
    if(value <= 0) {
      $('#message').html('Invalid Amount: Need to be at least 0.01');
      messageDisplay.show();
      valueAddBtn.attr("disabled", false);
      setTimeout(function() {
        messageDisplay.hide();
      }, 3000)
      return
    }
    App.contracts.Transaction.deployed().then(function (instance) {
      txInstance = instance;
      valueAddBtn.attr("disabled", true);
      return txInstance.addValue.sendTransaction(valueForContract, {from: App.account})
    }).then(function() {
      $('#message').html(value + ' dollar is added');
      valueAddBtn.attr("disabled", false);
      $('#addValueForm')[0].reset();
      messageDisplay.show();
      setTimeout(function() {
        messageDisplay.hide();
      }, 5000)
      return txInstance.getUser(App.account);
    }).then(function(user) {
      $("#userValue").html("Current Dollar: $ " + (parseFloat(user[3]) / 100).toFixed(2));
    }).catch(function(err) {
      if (err.code == 4001) {
        $('#message').html('Value added failed due to transaction rejetion.');
        valueAddBtn.attr("disabled", false);
        messageDisplay.show();
        setTimeout(function() {
          messageDisplay.hide();
        }, 3000)
      }
    });
  },

  editInfo: function() {
    var userEditBtn = $('#userEditBtn');
    var firstName = $('#firstName').val();
    var lastName = $('#lastName').val();
    var userAddress = $('#userAddress').val();
    var value = 0;
    var messageDisplay = $('#messageDisplay');

    if(!firstName && !lastName && !userAddress) {
      $('#message').html('Invalid Data');
      messageDisplay.show();
      userEditBtn.attr("disabled", false);
      setTimeout(function() {
        messageDisplay.hide();
      }, 3000)
      return;
    }
    userEditBtn.attr("disabled", true);
    

    App.contracts.Transaction.deployed().then(function (instance) {
      return instance.editInfo.sendTransaction(firstName, lastName, userAddress, {from: App.account});
    }).then(function() {
      $('#message').html('Hi, ' + firstName + '. Your information has been edited.');
      messageDisplay.show();
      setTimeout(function() {
        messageDisplay.hide();
        window.location.replace("/userInfo.html");
      }, 2000)
    }).catch(function(err) {
      if (err.code == 4001) {
        $('#message').html('User info edit failed due to transaction rejetion.');
        userEditBtn.attr("disabled", false);
        messageDisplay.show();
        setTimeout(function() {
          messageDisplay.hide();
        }, 3000)
      }
    });
  }
};


$(function() {
  $(window).load(function() {
    App.init();
  });
});