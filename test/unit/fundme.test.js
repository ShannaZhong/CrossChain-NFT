const { ethers, deployments } = require("hardhat");
const { assert, expect } = require("chai");
const helpers = require("@nomicfoundation/hardhat-network-helpers");

describe("test fundMe contract", async function() {
  let fundMe;
  let fundMeSeconedAccount;
  let firstAccount;
  let MockV3Aggregator;
  beforeEach(async function() {
    await deployments.fixture(["all"]);
    firstAccount = (await getNamedAccounts()).firstAccount;
    secondAccount = (await getNamedAccounts()).secondAccount;
    const fundMeDeployment = await deployments.get("FundMe");
    MockV3Aggregator = await deployments.get("MockV3Aggregator");
    fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address);
    fundMeSeconedAccount = await ethers.getContract("FundMe", secondAccount);
  })

  it("test if the owner is msg.sender", async function () {
    await fundMe.waitForDeployment();
    assert.equal((await fundMe.owner()), firstAccount);
  })

  it("test if the datafeed is assigned correctly", async function () {
    await fundMe.waitForDeployment();
    assert.equal((await fundMe.dataFeed()), MockV3Aggregator.address);
  })

  // fund, getFund, refund
  // uint test for fund
  // window open, value greater than minimum vlue, funder balance
  it("window closed, value greater than minimum, fund failed",
    async function () {
      // make sure the window is closed 模拟挖矿时间
      await helpers.time.increase(510);
      await helpers.mine();
      // value greater than minimum
      await expect(fundMe.fund({value: ethers.parseEther("0.01")})).to.be.revertedWith("window is closed"); // wei
    }
  )

  it("window open, value is less than minimum, fund failed",
    async function () {
      await expect(fundMe.fund({value: ethers.parseEther("0.001")})).to.be.revertedWith("Send more ETH");
    }
  )

  it("window open, value is greater than minimum, fund success",
    async function () {
      // value greater than minimum
      await fundMe.fund({value: ethers.parseEther("0.01")});
      const balance = await fundMe.fundersToAmount(firstAccount);
      expect(balance).to.equal(ethers.parseEther("0.01"));
    }
  )

  // uint test for getFund
  // onluOwner, windowClosed, target reached
  it("not owner, window closed, target reached, getFund failed",
    async function () {
      // make sure the target is reached
      await fundMe.fund({value: ethers.parseEther("0.01")});

      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();

      await expect(fundMeSeconedAccount.getFund()).to.be.revertedWith("this function can only be called by owner");
    }
  )

  it("window open, target reached, getFund failed",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.01")});
      await expect(fundMe.getFund()).to.be.revertedWith("window is not closed");
    }
  )

  it("window open, target not reached, getFund failed",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.005")});
      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();
      await expect(fundMe.getFund()).to.be.revertedWith("Target is not reached");
    }
  )

  it("window closed, target reached, getFund success",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.01")});
      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();
      await expect(fundMe.getFund()).to.emit(fundMe, "FundWithdrawByOwner").withArgs(ethers.parseEther("0.01"));
    }
  )

  // uint test for refund
  // window closed, target not reached, funder has balance
  it("window open, target not reached, funder has balance",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.005")});
      await expect(fundMe.refund()).to.be.revertedWith("window is not closed");
    }
  )

  it("window closed, target reached, funder has balance",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.01")});
      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();
      await expect(fundMe.refund()).to.be.revertedWith("Target is reached");
    }
  )

  it("window closed, target not reached, funder does not has balance",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.005")});
      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();
      await expect(fundMeSeconedAccount.refund()).to.be.revertedWith("there is no fund for you");
    }
  )

  it("window closed, target not reached, funder has balance",
    async function () {
      await fundMe.fund({value: ethers.parseEther("0.005")});
      // make sure the window is closed
      await helpers.time.increase(510);
      await helpers.mine();
      await expect(fundMe.refund()).to.emit(fundMe, "RefundByFunder").withArgs(firstAccount, ethers.parseEther("0.005"));
    }
  )
})