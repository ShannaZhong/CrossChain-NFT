// function depolyFunction() {
//   console.log("this is a depoly function");
// }

const { network } = require("hardhat");
const { LOCK_TIME, developmentChains, CONFIRMATION, networkConfig } = require("../helper-hardhat-config");

// module.exports.default=depolyFunction;

// module.exports = async(hre) => {
//   const getNamedAccounts = hre.getNamedAccounts;
//   const deployments = hre.deployments;
//   console.log("this is a deploy function");
// }

module.exports = async({getNamedAccounts, deployments}) => {
  const firstAccount = (await getNamedAccounts()).firstAccount;
  const { deploy } = deployments;

  let dataFeedAddr
  if(developmentChains.includes(network.name)) {
    const MockV3Aggregator = await deployments.get("MockV3Aggregator");
    dataFeedAddr = MockV3Aggregator.address;
  } else {
    dataFeedAddr = networkConfig[network.config.chainId].ethUsdPriceFeed;
  }
  // remove deployments directory or add --reset flag if you redeploy contract

  const fundMe = await deploy("FundMe", {
    from: firstAccount,
    args: [LOCK_TIME, dataFeedAddr],
    log: true,
    waitConfirmations: CONFIRMATION, // 等待5个区块确认
  })

  if(hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    await hre.run("verify:verify", {
      address: fundMe.address,
      constructorArguments: [LOCK_TIME, dataFeedAddr],
    });
  } else {
    console.log("network is not sepolia, verification skipped...");
  }
  
}

module.exports.tags = ["all", "fundme"];