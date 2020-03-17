const DVSRegistry = artifacts.require("DVSRegistry.sol");

module.exports = async function(deployer) {
    await deployer.deploy(DVSRegistry)
    const dvsRegistry = await DVSRegistry.deployed()
};