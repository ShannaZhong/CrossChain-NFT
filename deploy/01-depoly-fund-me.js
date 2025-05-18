// function depolyFunction() {
//   console.log("this is a depoly function");
// }

// module.exports.default=depolyFunction;

// module.exports = async(hre) => {
//   const getNamedAccounts = hre.getNamedAccounts;
//   const deployments = hre.deployments;
//   console.log("this is a deploy function");
// }

module.exports = async({getNamedAccounts, deployments}) => {
  const firstAccount = (await getNamedAccounts()).firstAccount;
  const { deploy } = deployments;
  await deploy("FundMe", {
    from: firstAccount,
    args: [500],
    log: true,
  })
  console.log(`firstAccount is ${firstAccount}`);
  console.log("this is a deploy function");
}

module.exports.tags = ["all", "fundme"];