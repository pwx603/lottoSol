const path = require('path');
const fs = require('fs');
const solc = require('solc')

const contractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol')
const source = fs.readFileSync(contractPath, 'utf8');


//SolC can compile multiple smart contracts
module.exports = solc.compile(source,1).contracts[':Lottery'];