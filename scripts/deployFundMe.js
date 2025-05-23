// import ethers.js
// create main function
// execute main function

const { ethers } = require("hardhat")

async function main() {
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

  // init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();

  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.005")});
  await fundTx.wait();

  // check balance of contract
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of contractc is ${balanceOfContract}`);

  // check contract with second account
  const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.004")});
  await fundTxWithSecondAccount.wait();

  // check balance of contract
  const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of contractc is ${balanceOfContractAfterSecondFund}`);

  // check mapping fundersToAmount
  const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
  const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
  console.log(`Balance of first account ${firstAccount.address} in fundMe is ${firstAccountBalanceInFundMe}`);
  console.log(`Balance of second account ${secondAccount.address} in fundMe is ${secondAccountBalanceInFundMe}`);
}

async function verifyFundMe(fundMeAddr, args) {
  await hre.run("verify:verify", {
    address: fundMeAddr,
    constructorArguments: args,
  });
}

main().then().catch((err) => {
  console.error(err);
  process.exit(0);
});