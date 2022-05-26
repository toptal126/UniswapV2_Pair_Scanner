require("dotenv").config();
const { MongoClient } = require("mongodb");
const KConsole = require("./helper/KConsole");
const { factoryContract } = require("./helper/web3_contract");

// Connection URL
const url = process.env.DB_URI;
const V2_FACTORY_ADDRESS = process.env.V2_FACTORY_ADDRESS;
const client = new MongoClient(url);

// Database Name
const dbName = "uniswap_v2_pairs";
const collectionName = "bsc";
async function main() {
    let startPair = 0;
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastPairId = await collection
        .find()
        .sort({ pairId: -1 })
        .skip(collection.count() - 1)
        .limit(1)
        .toArray();

    if (lastPairId.length === 0) startPair = 0;
    else startPair = lastPairId[0].pairId;
    KConsole.cyan("Starting Pair Id =>", startPair);
    const pcsV2Contract = await factoryContract(V2_FACTORY_ADDRESS);
    const pairLength = await pcsV2Contract.methods.allPairsLength().call();

    KConsole.cyan(pairLength);
}
main()
    .then(console.log)
    .catch(console.error)
    .finally(() => client.close());
