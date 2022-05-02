require('dotenv').config();

require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("@nomiclabs/hardhat-web3");
const { API_URL, PRIVATE_KEY } = process.env;
// require('./tasks/tasks');
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  },
  mocha: {
    timeout: 40000
  }
};