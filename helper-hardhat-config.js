const DECIMAL = 8;
const INITIAL_PRICE = 300000000000;
const LOCK_TIME = 500;
const developmentChains = ["hardhat", "local"];
const CONFIRMATION = 5;
const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  97: {
    name: "bnb-testnet",
    ethUsdPriceFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7",
  }
}

module.exports = {
  DECIMAL,
  INITIAL_PRICE,
  LOCK_TIME,
  developmentChains,
  CONFIRMATION,
  networkConfig,
}