const assert = require('assert');
const Web3 = require('web3')

const rpcAdr = "ws://localhost:8545"
const web3 = new Web3(rpcAdr);
const {
    interface,
    bytecode
} = require('../compile');

// Uncomment for ganache-cli support
// const ganache = require('ganache-cli')
// web3 = new Web3(ganache.provider()); 

let accounts;
let contract

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    contract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({
            data: "0x" + bytecode
        })
        .send({
            from: accounts[0],
            gas: "1000000"
        }); //include gas limit for local test on ganache

    // inbox = await new web3.eth.Contract(JSON.parse(interface))
    //     .deploy({data: bytecode, arguments:[INITIAL_MSG]})
    //     .send({from: accounts[0], gas: "1000000"})

})

describe("Lottery Contract Test", () => {
    it("Get Accountlist: ", () => {
        console.log("Accounts list: ", accounts);
        assert.ok(accounts);
    })

    it("Success contract deployment: ", () => {
        assert.ok(contract.options.address)
    });

    it("Allow one account to enter: ", async () => {
        let sender = accounts[1]
        await contract.methods.enter().send({
            from: sender,
            value: web3.utils.toWei("2", "ether")
        })
        const player = await contract.methods.players(0).call();

        assert.equal(sender, player)
    })

    it("Allow multiple accounts to enter: ", async () => {
        await contract.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei("1", "ether")
        })

        await contract.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei("2", "ether")
        })

        await contract.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei("3", "ether")
        })

        const players = await contract.methods.getPlayers().call();

        for (let i in players) {
            assert.equal(accounts[i], players[i]);
        }

        const balance = await contract.methods.getBalance().call();
        assert.equal(web3.utils.toWei("6", "ether"), balance);
    })

    it("Invalid ammount of ether sent: ", async () => {
        let smallWei = 200;

        try {
            await contract.methods.enter().send({
                from: accounts[0],
                value: smallWei
            });
        } catch (err) {
            // console.log(err);
            assert(err);
            return;
        }
        assert.fail();
    })

    it("Only contract manager can call pickWinner(): ", async () => {
        let sender = accounts[1];
        let manager = await contract.methods.manager().call();

        await contract.methods.enter().send({
            from: sender,
            value: web3.utils.toWei("2", "ether")
        })

        assert.notEqual(manager, sender)

        try {
            await contract.methods.pickWinner().send({
                from: sender
            });
        } catch (err) {
            assert(err);
            return;
        }
        assert.fail();
    })

    it("End-to-end testing: ", async()=>{
        let sender = accounts[1];
        let manager = await contract.methods.manager().call();
        let valueSent = web3.utils.toWei("2", "ether");
    
        const contractAdr = (await contract.methods.enter().send({
            from: sender,
            value: valueSent
        })).transactionHash;

        let senderIniBalance = await web3.eth.getBalance(sender);

        let trans = await contract.methods.pickWinner().send({
            from: manager
        });

        //let gasPrice= (await web3.eth.getTransaction(trans.transactionHash)).gasPrice;
    
        let senderFinalBalance = await web3.eth.getBalance(sender);

        assert.equal(senderFinalBalance - senderIniBalance, valueSent)
        // ensure that the balance of the contract gets cleared
        assert.equal(await contract.methods.getBalance().call(), 0);
        // ensure that the players list gets cleared
        assert.equal((await contract.methods.getPlayers().call()).length,0)
    })
})