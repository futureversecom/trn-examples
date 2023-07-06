module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (!deployer) {
    throw new Error("Missing named accounts");
  }

  await deploy("Counter", {
    contract: "Counter",
    from: deployer,
    args: [0], // Optional: Use if your smart contract requires arguments
    log: true,
  });
};
module.exports.tags = ["Counter"];
