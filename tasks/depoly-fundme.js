const { task } = require("hardhat/config");

task("depoly-fundme", "depoly and verify fundme contract").setAction(async(taskArgs, hre) => {
  // create factory
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  console.log("contract deploying")
  // deploy contract from factory
  const fundMe = await fundMeFactory.deploy(500);
  await fundMe.waitForDeployment();
  console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);

  // verify fundme
  if(hre.network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("wait for 5 confirmations");
    await fundMe.deploymentTransaction().wait(5);
    await verifyFundMe(fundMe.target, [500]);
  } else {
    console.log("verification skipped");
  }
})

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

module.exports = {}