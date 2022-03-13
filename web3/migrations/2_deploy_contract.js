var nhl_pool_prediction = artifacts.require("./NHLGamePredictions");

module.exports = function (deployer) {
  deployer.deploy(nhl_pool_prediction);
};
