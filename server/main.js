require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const fs = require('fs');
const Logger = require('./logger_service');
const logger = new Logger('app');
var TruffleContract = require('truffle-contract');
var Web3 = require('web3');

var web3Provider = new Web3.providers.WebsocketProvider('ws://localhost:7545');

var contracts = {};
fs.readFile(__dirname + '/../build/contracts/Transaction.json', function(error, rawdata) {
  let transaction = JSON.parse(rawdata);
  // Instantiate a new truffle contract from the artifact
  contracts.Transaction = TruffleContract(transaction);
  // Connect provider to interact with contract
  contracts.Transaction.setProvider(web3Provider);
  contracts.Transaction.deployed().then( function (instance) {
    instance.allEvents().on('data', function (result) {
      if(result) {
        eventName = result.event;
        data = result.args;
        switch(eventName) {
          case "AddUser":
            logger.info("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Event: New Account")
            break;
          case "AddValue":
            logger.info("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Event: Change Value")
            break;
          case "EditInfo":
            logger.info("Name: " + data.firstName + " | Dollar: " + (parseFloat(data.value) / 100).toFixed(2) + " | Event: Edit Info")
            break;
        }
      }
    }).on('error', function(error) {
      if(error) {
        console.warn(error)
      }
    });
  });
});

app.use(express.static('client'));
app.use(express.static('build/contracts'));
app.post('/', (req, res) => {
  // res.sendFile(`${__dirname}/client/index.html`);
});

app.get('*', (req, res) => {
  res.status(404);
  res.send('Ooops... this URL does not exist');
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});