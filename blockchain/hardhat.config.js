require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      accounts: {
        mnemonic: "circle much knife glimpse cupboard story useless used coffee join float midnight",
        path: "m/44'/60'/0'/0/",
        initialIndex: 0,
        count: 20,
        passphrase: ""
      }
    }
  }
};
