const Web3 = require("web3");
const web3Provider = new Web3.providers.HttpProvider(process.env.RPC_URL);
const web3 = new Web3(web3Provider);
const ABI_UNISWAP_V2_FACTORY = require("../abis/ABI_UNISWAP_V2_FACTORY.json");
const ABI_ERC20 = require("../abis/ABI_ERC20.json");
const factoryContract = (address) => {
    return (_contract = new web3.eth.Contract(ABI_UNISWAP_V2_FACTORY, address));
};
const erc20Contract = (address) => {
    return (_contract = new web3.eth.Contract(ABI_ERC20, address));
};

module.exports = { factoryContract, erc20Contract };
