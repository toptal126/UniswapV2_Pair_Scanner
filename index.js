require("dotenv").config();
const { MongoClient } = require("mongodb");
const KConsole = require("./helper/KConsole");
const {
    factoryContract,
    v2PairContract,
    erc20Contract,
} = require("./helper/web3_contract");
const fetch = require("node-fetch");

// Connection URL
const url = process.env.DB_URI;
const V2_FACTORY_ADDRESS = process.env.V2_FACTORY_ADDRESS;
const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

const client = new MongoClient(url);

// Database Name
const dbName = "uniswap_v2_pairs";
const chainName = "bsc";
let db;
let collection;

const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

const FIXED_PRICE_TOKENS = [
    {
        address: "0x55d398326f99059fF775485246999027B3197955",
        price: 1,
    },
    {
        address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
        price: 1,
    },
    {
        address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        price: 1,
    },
];

const connectDB = async () => {
    await client.connect();
    console.log("Connected successfully to server");
    db = client.db(dbName);
    collection = db.collection(chainName);
};

const moralisTokenApi = async (address) => {
    const response = await fetch(
        `https://deep-index.moralis.io/api/v2/erc20/${address}/price?chain=${chainName}`,
        {
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": MORALIS_API_KEY,
            },
        }
    );
    const data = await response.json();
    return data;
};

const tokenInfoPCSV2Api = async (address, pairIndex) => {
    let i = 0;
    while (i < 5)
        try {
            const response = await fetch(
                `https://api.pancakeswap.info/api/v2/tokens/${address}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-API-KEY": MORALIS_API_KEY,
                    },
                }
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.log(
                address,
                `panackeswap api error with pair :try again ${i} times`,
                pairIndex
            );
            i++;
        }
    process.exit();
};

const getPairInfobyIndex = async (pairIndex, pcsV2Contract) => {
    try {
        const pairAddress = await pcsV2Contract.methods
            .allPairs(pairIndex)
            .call();
        const pairContract = v2PairContract(pairAddress);
        const [token0, token1, reserves] = await Promise.all([
            pairContract.methods.token0().call(),
            pairContract.methods.token1().call(),
            pairContract.methods.getReserves().call(),
        ]);

        if (reserves._reserve0 == 0 || reserves._reserve1 == 0) return;
        try {
            const token0Contract = erc20Contract(token0);
            const token1Contract = erc20Contract(token1);

            const [token0Decimals, token1Decimals] = await Promise.all([
                token0Contract.methods.decimals().call(),
                token1Contract.methods.decimals().call(),
            ]);

            const [pcsV2ResultToken0, pcsV2ResultToken1] = await Promise.all([
                tokenInfoPCSV2Api(token0, pairIndex),
                tokenInfoPCSV2Api(token1, pairIndex),
            ]);

            let reserve_usd = 0;
            if (token0 === WBNB_ADDRESS) {
                reserve_usd =
                    ((parseFloat(pcsV2ResultToken0.data.price) *
                        reserves._reserve0) /
                        10 ** token0Decimals) *
                    2;
            } else if (
                FIXED_PRICE_TOKENS.filter(
                    (item) => item.address === token0 || item.address === token1
                ).length > 0
            ) {
                FIXED_PRICE_TOKENS.forEach((item) => {
                    if (item.address === token0) {
                        reserve_usd =
                            ((parseFloat(item.price) * reserves._reserve0) /
                                10 ** token0Decimals) *
                            2;
                    } else if (item.address === token1) {
                        reserve_usd =
                            ((parseFloat(item.price) * reserves._reserve1) /
                                10 ** token1Decimals) *
                            2;
                    }
                });
            } else {
                reserve_usd =
                    ((parseFloat(pcsV2ResultToken1.data.price) *
                        reserves._reserve1) /
                        10 ** token1Decimals) *
                    2;
            }

            const updateDBItem = {
                pairIndex,
                pairAddress,
                token0,
                token1,
                token0Name: pcsV2ResultToken0.data.name,
                token1Name: pcsV2ResultToken1.data.name,
                token0Symbol: pcsV2ResultToken0.data.symbol,
                token1Symbol: pcsV2ResultToken1.data.symbol,
                token0Decimals,
                token1Decimals,
                reserve0: reserves._reserve0,
                reserve1: reserves._reserve1,
                token0Price: parseFloat(pcsV2ResultToken0.data.price),
                token1Price: parseFloat(pcsV2ResultToken1.data.price),
                reserve_usd,
            };

            // KConsole.cyan(updateDBItem);
            // if (updateDBItem.reserve_usd ===)
            await collection.updateOne(
                { pairIndex: pairIndex },
                { $set: updateDBItem },
                { upsert: true }
            );
            return updateDBItem;
        } catch (error) {
            console.log("error with processing pair", pairAddress, pairIndex);
            return;
        }
    } catch (error) {
        console.log("error", pairIndex, error);
        process.exit();
    }
};
async function main() {
    let startPair = 0;
    let batchCount = 1000;
    await connectDB();
    const lastPairIndex = await collection
        .find()
        .sort({ pairIndex: -1 })
        .skip(collection.count() - 1)
        .limit(1)
        .toArray();

    if (lastPairIndex.length === 0) startPair = 0;
    else startPair = lastPairIndex[0].pairIndex;
    const pcsV2Contract = await factoryContract(V2_FACTORY_ADDRESS);
    const pairLength = await pcsV2Contract.methods.allPairsLength().call();
    if (process.argv[2]) startPair = process.argv[2];

    KConsole.cyan("Starting Pair Id =>", startPair - batchCount);
    for (let i = startPair - batchCount; i < pairLength; i += batchCount) {
        let idArr = Array.from(
            { length: batchCount },
            (_, offset) => i + offset
        ).filter((item) => item < pairLength);

        KConsole.cyan(`processing ${i} ~ ${idArr.at(-1)}`);
        // const pairInfoArr =
        await Promise.all(
            idArr.map((pairIndex) =>
                getPairInfobyIndex(pairIndex, pcsV2Contract)
            )
        );
        // console.log(pairInfoArr);
        KConsole.cyan(`updating database ${i} ~ ${idArr.at(-1)}: finished`);
    }

    KConsole.cyan(pairLength);
}
const updateTopPairs = async () => {
    let cap = 1000000;
    if (process.argv[3]) cap = parseInt(process.argv[3]);
    let batchCount = 500;
    await connectDB();
    let topPairIndex = await collection
        .find({ reserve_usd: { $gt: cap } })
        .sort({ reserve_usd: -1 }, { pairIndex: 1 })
        .toArray();

    KConsole.cyan(`Their are ${topPairIndex.length} pairs larger than $${cap}`);

    const pcsV2Contract = await factoryContract(V2_FACTORY_ADDRESS);
    const pairLength = await pcsV2Contract.methods.allPairsLength().call();
    for (i = 0; i < topPairIndex.length; i += batchCount) {
        let idArr = Array.from(
            { length: batchCount },
            (_, offset) => topPairIndex.at(i + offset)?.pairIndex
        ).filter((item) => item !== undefined);

        KConsole.cyan(`processing ${batchCount} from `, i);
        await Promise.all(
            idArr.map((pairIndex) =>
                getPairInfobyIndex(pairIndex, pcsV2Contract)
            )
        );
        KConsole.cyan(`processing ${batchCount} from ${i} done!`);
    }
};

const remoZero = async () => {
    await connectDB();
    let emptyLength = await collection.deleteMany({ reserve_usd: 0 });
    KConsole.cyan(`Pairs with empty reserve ${emptyLength.length}`);
};

const dirtyPairs = async () => {
    const dirtyPairArr = [];

    await connectDB();
    let emptyLength = await collection.deleteMany({
        pairAddress: { $in: dirtyPairArr },
    });
    KConsole.cyan(`Pairs with empty reserve ${emptyLength.length}`);
};

if (process.argv[2] === "update-top")
    updateTopPairs()
        .then(console.log)
        .catch(console.error)
        .finally(process.exit);
else if (process.argv[2] === "remove-zero")
    remoZero().then(console.log).catch(console.error).finally(process.exit);
else if (process.argv[2] === "dirty-pairs")
    dirtyPairs().then(console.log).catch(console.error).finally(process.exit);
else main().then(console.log).catch(console.error).finally(process.exit);
