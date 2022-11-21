const { MongoClient, ServerApiVersion } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");

const { startLocalCmk, startCreateEncryptedCollection } = require("./config/init.config");

const secretDB = "userRecords";
const secretCollection = "users";

startLocalCmk("./master-key.txt");

async function run() {

  await startCreateEncryptedCollection(secretDB, secretCollection);

}
  
run().catch(console.dir);
