const { task } = require("hardhat/config");

task("interact-fundme", "interact with fundme contract").addParam("addr", "fundme contract address").setAction(async (taskArgs, hre) => {
  const fundMeFactory = await ethers.getContractFactory("FundMe");
  const fundMe = fundMeFactory.attach(taskArgs.addr);

  // init 2 accounts
  const [firstAccount, secondAccount] = await ethers.getSigners();

  // fund contract with first account
  const fundTx = await fundMe.fund({ value: ethers.parseEther("0.005")});
  await fundTx.wait();

  // check balance of contract
  const balanceOfContract = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of contractc is ${balanceOfContract}`);

  // check contract with second account
  const fundTxWithSecondAccount = await fundMe.connect(secondAccount).fund({ value: ethers.parseEther("0.005")});
  await fundTxWithSecondAccount.wait();

  // check balance of contract
  const balanceOfContractAfterSecondFund = await ethers.provider.getBalance(fundMe.target);
  console.log(`balance of contractc is ${balanceOfContractAfterSecondFund}`);

  // check mapping fundersToAmount
  const firstAccountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
  const secondAccountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address);
  console.log(`Balance of first account ${firstAccount.address} in fundMe is ${firstAccountBalanceInFundMe}`);
  console.log(`Balance of second account ${secondAccount.address} in fundMe is ${secondAccountBalanceInFundMe}`);

})

module.exports = {}