const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const { startClient, startKeyVaultKmsProviders } = require("./config/server.config");

const { factoryRouter } = require("./routes/server.route");

const app = express();

//parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//// Mongo connection ////////////////////////

let unencryptedUserColl, 
    encryptedUserColl, 
    unencryptedTransactColl, 
    encryptedTransactColl;

const { kmsProviders } = startKeyVaultKmsProviders();

(async function connect() {

  const startClient_ = await startClient(kmsProviders);

  unencryptedUserColl = startClient_.unencryptedUserColl;
  encryptedUserColl = startClient_.encryptedUserColl; 
  unencryptedTransactColl = startClient_.unencryptedTransactColl;
  encryptedTransactColl = startClient_.encryptedTransactColl;

  const connections = { unencryptedUserColl,
                        encryptedUserColl,
                        unencryptedTransactColl,
                        encryptedTransactColl
  };

  //routing
  const { get, 
          getById, 
          getByIdUnencrypted,
          post,
          put,
          remove,
          transaction,
          transactions } = await factoryRouter(connections);

  app.use('/api',[get, 
                  getById, 
                  getByIdUnencrypted,
                  post,
                  put,
                  remove,
                  transaction,
                  transactions]);

  //init
  const port = process.env.port || "9000";
  app.set('port', port);

  const server = http.createServer(app);

  server.listen(port,() => console.log(`Running server on localhost: ${port}`));

})();

//// Mongo connection ////////////////////////

