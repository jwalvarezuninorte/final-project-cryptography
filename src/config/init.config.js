const fs = require("fs");
const crypto = require("crypto");

const { MongoClient, ServerApiVersion } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");

const {
  KEY_VAULT_DATABASE,
  KEY_VAULT_COLLECTION,
  MONGODB_URI,
  SHARED_LIB_PATH,
} = require("./properties.config");

const keyVaultNamespace = `${KEY_VAULT_DATABASE}.${KEY_VAULT_COLLECTION}`;

const startLocalCmk = () => {
  // start-local-cmk
  try {
    fs.writeFileSync("./master-key.txt", crypto.randomBytes(96));
  } catch (err) {
    console.error(err);
  }
  // end-local-cmk
};

const startKmsProviders = () => {
  // start-kmsproviders
  const provider = "local";
  // WARNING: Do not use a local key file in a production application
  const localMasterKey = fs.readFileSync("./master-key.txt");
  const kmsProviders = {
    local: {
      key: localMasterKey,
    },
  };

  return {
    provider,
    kmsProviders,
    localMasterKey,
  };
  // end-kmsproviders
};

const startCreateIndex = async () => {
  // start-create-index
  const keyVaultClient = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });
  await keyVaultClient.connect();
  const keyVaultDB = keyVaultClient.db(KEY_VAULT_DATABASE);
  // Drop the Key Vault Collection in case you created this collection
  // in a previous run of this application.
  await keyVaultDB.dropDatabase();
  const keyVaultColl = keyVaultDB.collection(KEY_VAULT_COLLECTION);
  await keyVaultColl.createIndex(
    { keyAltNames: 1 },
    {
      unique: true,
      partialFilterExpression: { keyAltNames: { $exists: true } },
    }
  );

  return {
    keyVaultClient,
  };
  // end-create-index
};

const startCreateDek = async (
  keyVaultClient,
  keyVaultNamespace,
  kmsProviders,
  provider
) => {
  // start-create-dek
  const clientEnc = new ClientEncryption(keyVaultClient, {
    keyVaultNamespace: keyVaultNamespace,
    kmsProviders: kmsProviders,
  });
  const dek1 = await clientEnc.createDataKey(provider, {
    keyAltNames: ["dataKey1"],
  });
  const dek2 = await clientEnc.createDataKey(provider, {
    keyAltNames: ["dataKey2"],
  });
  const dek3 = await clientEnc.createDataKey(provider, {
    keyAltNames: ["dataKey3"],
  });
  const dek4 = await clientEnc.createDataKey(provider, {
    keyAltNames: ["dataKey4"],
  });
  // end-create-dek

  return {
    dek1,
    dek2,
    dek3,
    dek4,
  };
};

const startCreateEncryptedCollection = async (secretDB, secretCollection) => {
  const { kmsProviders, provider } = startKmsProviders("./master-key.txt");

  const { keyVaultClient } = await startCreateIndex();

  const { dek1, dek2, dek3, dek4 } = await startCreateDek(
    keyVaultClient,
    keyVaultNamespace,
    kmsProviders,
    provider
  );

  // start-create-enc-collection
  const encryptedFieldsMap = {
    [`${secretDB}.${secretCollection}`]: {
      fields: [
        {
          keyId: dek1,
          path: "id",
          bsonType: "long",
          queries: { queryType: "equality" },
        },
        {
          keyId: dek2,
          path: "password",
          bsonType: "string",
        },
        {
          keyId: dek3,
          path: "totalCash",
          bsonType: "double",
        },
        {
          keyId: dek4,
          path: "transactions",
          bsonType: "array",
        },
      ],
    },
  };

  const extraOptions = {
    cryptSharedLibPath: SHARED_LIB_PATH,
  };

  const encClient = new MongoClient(MONGODB_URI, {
    autoEncryption: {
      keyVaultNamespace,
      kmsProviders,
      extraOptions,
      encryptedFieldsMap,
    },
  });
  await encClient.connect();
  const newEncDB = encClient.db(secretDB);
  // Drop the encrypted collection in case you created this collection
  // in a previous run of this application.
  await newEncDB.dropDatabase();
  await newEncDB.createCollection(secretCollection);
  console.log("Created encrypted collection!");
  // end-create-enc-collection
  await keyVaultClient.close();
  await encClient.close();
};

module.exports = {
  startLocalCmk,
  startCreateEncryptedCollection,
};
