import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import web3 from './web3'
import contract from './contract'

class App extends Component {
  state = {
    manager: "",
    players: [],
    balance: "",
    value: "12",
    message: ""
  };

  async componentDidMount(){
    const manager = await contract.methods.manager().call();
    const players = await contract.methods.getPlayers().call();
    const address = contract.options.address;
    const balance = await web3.eth.getBalance(address);

    //const balance = await web3.eth.getBalance(c)

    this.setState({manager, players, balance})
  }

  onSubmit = async(event)=>{
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({message: "Waiting on transaction success..."});

    try{
      await contract.methods.enter().send({
        from: accounts[0],
        value: web3.utils.toWei(this.state.value, 'ether')
      });
      this.setState({message: "You have been entered!"})
    }catch(err){
      this.setState({message: "You have failed to enter the Lottery"})
    }
  };

  onClick =  async(event)=>{
    event.preventDefault();

    const accounts = await web3.eth.getAccounts();

    this.setState({message: "Waiting on transaction success..."});
    await contract.methods.pickWinner().send({from: accounts[0]})
    this.setState({message: "A winner has picked"});
    
  }

  render() {
    web3.eth.getAccounts().then(console.log)

    return (
      <div>
        <h2>Lottery Contract</h2>
        <p>
          This contract is managed by: {this.state.manager}.
          There are currently {this.state.players.length} people entered 
          competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
        </p>
        <hr />
        <form onSubmit = {this.onSubmit}>
          <h4>Want to try your luck?</h4>
          <div>
            <label>Amount of ether to enter</label>
            <input 
              value = {this.state.value}
              onChange={(event)=>this.setState({ value: event.target.value})}
              />
            </div>
            <button>Enter</button>
        </form>

        <hr />
        <h1><i>{this.state.message}</i></h1>
        <hr />
        <h4>Ready to pick a winner?</h4>
        <button onClick={this.onClick}>Pick a winner!</button>
        </div>
    );
  }
}

export default App;
