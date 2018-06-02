const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
    "cereal senior inside twice shrimp stage civil army crawl million bamboo onion",
    "https://ropsten.infura.io/G8NOfOSBpQTVKm6LQBmV"
);

const web3 = new Web3(provider);

let accounts;

(async () => {
    accounts = await web3.eth.getAccounts();

    console.log("Attempting to deploy from account: ", accounts[0])

    const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: "0x" + bytecode})
    .send({from: accounts[0]});
    
    console.log("Contract deployed to: ", result.options.address);
    process.exit();
})();