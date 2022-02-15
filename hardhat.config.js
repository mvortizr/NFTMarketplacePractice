require("@nomiclabs/hardhat-waffle");
require('dotenv').config();

const PROJECT_ID = process.env.INFURA_PROJECT_ID
const PRIVATE_KEY = process.env.METAMASK_WALLET_SECRET

module.exports = {
  networks:{
    hardhat:{
      chainId: 1337
    }, //nodo local
    mumbai:{
      url: `https://polygon-mumbai.infura.io/v3/${PROJECT_ID}`,
      accounts:[PRIVATE_KEY]
    },
    mainnet:{
      url: `https://polygon-mainnet.infura.io/v3/${PROJECT_ID}`,
      accounts:[PRIVATE_KEY]
    }
  },
  solidity: "0.8.4",
};


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

// /**
//  * @type import('hardhat/config').HardhatUserConfig
//  */
