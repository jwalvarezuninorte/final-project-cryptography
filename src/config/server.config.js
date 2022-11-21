const { MongoClient  } = require("mongodb");
const fs = require("fs");

const { KEY_VAULT_DATABASE,
        KEY_VAULT_COLLECTION,
        MONGODB_URI,
        SHARED_LIB_PATH } = require("./properties.config");

const keyVaultNamespace = `${KEY_VAULT_DATABASE}.${KEY_VAULT_COLLECTION}`;

const secretDB = "userRecords";
const secretCollection = "users";
const secretTransactionCollection = "transactions";

//mongo connect variables
let unencryptedClient, 
    encryptedClient, 
    unencryptedUserColl, 
    encryptedUserColl, 
    unencryptedTransactColl, 
    encryptedTransactColl;

const startKeyVaultKmsProviders = () => {

    //// Mongo connection ////////////////////////

    // start-kmsproviders
    const path = "./master-key.txt";
    // WARNING: Do not use a local key file in a production application
    const localMasterKey = fs.readFileSync(path);
    const kmsProviders = {
        local: {
            key: localMasterKey,
        },
    };
    // end-kmsproviders

    return {
        kmsProviders,
    };

};

const startSchema = async () => {
    // start-schema
    console.log('starting schema, please wait ......');
    unencryptedClient = new MongoClient(MONGODB_URI);
    await unencryptedClient.connect();
    const keyVaultClient = unencryptedClient.db(KEY_VAULT_DATABASE).collection(KEY_VAULT_COLLECTION);

    const dek1 = await keyVaultClient.findOne({ keyAltNames: "dataKey1" });
    const dek2 = await keyVaultClient.findOne({ keyAltNames: "dataKey2" });
    const dek3 = await keyVaultClient.findOne({ keyAltNames: "dataKey3" });
    const dek4 = await keyVaultClient.findOne({ keyAltNames: "dataKey4" });

    const encryptedFieldsMap = {
    [`${secretDB}.${secretCollection}`]: {
        fields: [
        {
            keyId: dek1._id,
            path: "id",
            bsonType: "long",
            queries: { queryType: "equality" },
        },
        {
            keyId: dek2._id,
            path: "password",
            bsonType: "string",
        },
        {
            keyId: dek3._id,
            path: "totalCash",
            bsonType: "double",
        },
        {
            keyId: dek4._id,
            path: "transactions",
            bsonType: "array",
        },
        ],
    },
    };

    return {
        encryptedFieldsMap,
    };
    // end-schema
};

const startClient = async(kmsProviders) => {

    const { encryptedFieldsMap } = await startSchema();

    // start-extra-options
    const extraOptions = {
        cryptSharedLibPath: SHARED_LIB_PATH,
      };
    // end-extra-options
      
    // start-client
    encryptedClient = new MongoClient(MONGODB_URI, {
        autoEncryption: {
        keyVaultNamespace: keyVaultNamespace,
        kmsProviders: kmsProviders,
        extraOptions: extraOptions,
        encryptedFieldsMap: encryptedFieldsMap,
        },
    });

    await encryptedClient.connect();
    
    unencryptedUserColl = unencryptedClient
    .db(secretDB)
    .collection(secretCollection);
    
    unencryptedTransactColl = unencryptedClient
    .db(secretDB)
    .collection(secretTransactionCollection);
    
    encryptedUserColl = encryptedClient
    .db(secretDB)
    .collection(secretCollection);
    
    encryptedTransactColl = encryptedClient
    .db(secretDB)
    .collection(secretTransactionCollection);

    return {
        unencryptedUserColl, 
        encryptedUserColl, 
        unencryptedTransactColl, 
        encryptedTransactColl
    };
};

module.exports = {
    startClient,
    startKeyVaultKmsProviders
};
