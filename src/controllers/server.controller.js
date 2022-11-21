const crypto = require("crypto");
const moment = require("moment");
const { Double, Long } = require("mongodb");

const factoryController = async (connections) => {

    const { unencryptedUserColl,
            encryptedUserColl,
            unencryptedTransactColl,
            encryptedTransactColl } = connections;

    //// User Controllers /////////////////////////////////////////////////////////////////////////

    /* GET all users. */
    const get_ = async (req, res) => {
        try{
            await unencryptedUserColl.find({}).toArray((err, result) => {
                if (err && err.length) { 
                    res.json({ result: [], error: 'No se pudo obtener la lista de todos los usuarios. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({result: result || [], error:''});
                }
            });
        }
        catch(e) {
           res.json({ result: [], error: e.message});
        }
    };

    /* GET user by id. */
    const getById_ = async (req, res) => {
        
        const { id } = req.params;

        const userId = Long.fromInt(parseInt(id));

        try{

            const userUnencrypted = await encryptedUserColl.findOne({ id: userId });

            const { _id } = userUnencrypted;

            await unencryptedUserColl.findOne({ _id }, (err, result) => {
                if (err && err.length) { 
                    res.json({ result: {}, error: 'No se pudo obtener los datos del usuario. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({result: result || {}, error:''});
                }
            });
        }
        catch(e) {
          res.json({ result: {}, error: e.message});
        }
    };

    /* GET user by id with unencrypted data. */
    const getByIdUnencrypted_ = async (req, res) => {
        
        const { id } = req.params;

        const userId = Long.fromInt(parseInt(id));

        try{

        await encryptedUserColl.findOne({ id: userId }, (err, result) => {
                if (err && err.length) { 
                    res.json({ result: {}, error: 'No se pudo obtener los datos del usuario. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({result: result || {}, error:''});
                }
            });
        }
        catch(e) {
          res.json({ result: {}, error: e.message});
        }

    };

    /* POST new user. */
    const post_ = async (req, res) => {
        try{
            const { user } = req.body;
            user.id = Long.fromInt(user.id);
            user.totalCash = Double(user.totalCash);
            await encryptedUserColl.insertOne(user,(err, result) => {
                if (err && err.length) { 
                    res.json({ result: {}, error: 'No se pudo crear el usuario. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({ result , error:''});
                }
            });
        }
        catch(e) {
           res.json({ result: {}, error: e.message});
        }
    };

    /* PUT new user. */
    const put_ = async (req, res) => {
        try{
            const { user } = req.body;
            
            user.id = Long.fromInt(user.id);
            user.totalCash = Double(user.totalCash);
    
            const { id } = user;
    
            const query = { id };
    
            const { email, 
                    fullName , 
                    password, 
                    username, 
                    totalCash, 
                    transactions } = user;
    
            const values = { $set: { email, fullName, password, username, totalCash, transactions }};
            await encryptedUserColl.updateOne(query, values , (err, result) => {
                if (err && err.length) { 
                    res.json({ result: {}, error: 'No se pudo actualizar el usuario. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({ result , error:''});
                }
            });
        }
        catch(e) {
           res.json({ result: {}, error: e.message});
        }
    };

    /* DELETE user by id. */
    const delete_ = async (req, res) => {
        try{
            const { id } = req.params;
            
            const userId = Long.fromInt(id);
    
            const query = { id: userId };
    
            await encryptedUserColl.deleteOne(query, (err, result) => {
                if (err && err.length) { 
                    res.json({ result: {}, error: 'No se pudo eliminar el usuario. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({ result , error:''});
                }
            });
        }
        catch(e) {
           res.json({ result: {}, error: e.message});
        }
    };

     //// Transactions Controllers ///////////////////////////////////////////////////////////////

    /* GET all transactions. */
    const transactions_ = async (req, res) => {
        try{
            await unencryptedTransactColl.find({}).toArray((err, result) => {
                if (err && err.length) { 
                    res.json({ result: [], error: 'No se pudo obtener la lista de todas las transacciones. Por favor, intente de nuevo.'});
                }
                else {
                    res.json({result: result || [], error:''});
                }
    
            });
        }
        catch(e) {
           res.json({ result: [], error: e.message});
        }
    };

    /* POST new transaction. */
    const transaction_ = async (req, res) => {
        try{
            const { transaction } = req.body;
            const { amount , 
                    emitterId, 
                    type = 'Ingreso', 
                    username } = transaction;

            const emitterUserId = Long.fromInt(parseInt(emitterId));
    
            const receiverUser = await encryptedUserColl.findOne({ username });

            const emitterUser = await encryptedUserColl.findOne({ id: emitterUserId });
    
            // console.log(receiverUser);
    
            if (receiverUser) {
    
                const newTransaction = {
                    amount,
                    date: moment().format('YYYY/MM/DD'),
                    emitterId,
                    id: crypto.randomUUID(),
                    receiverId: receiverUser.id,
                    type,
                    username
                };
    
                const insertedTransaction = await encryptedTransactColl.insertOne(newTransaction);
    
                if(insertedTransaction && insertedTransaction.insertedId) {
    
                    const query = {id : Long.fromInt(receiverUser.id) };
    
                    const transactions = [...receiverUser.transactions, newTransaction];
    
                    const values = { $set: { totalCash: Double(receiverUser.totalCash + amount ), transactions: transactions }};

                    const updatedUserReference =  await encryptedUserColl.updateOne(query, values);

                    if (updatedUserReference && updatedUserReference.modifiedCount !== 0) {

                        const queryEmitter = {id : Long.fromInt(emitterUser.id) };

                        const newTransactionEmitter = {
                            ...newTransaction,
                            type: newTransaction.type === 'Ingreso' ? 'Egreso' : 'Ingreso', 
                        }
    
                        const transactionsEmitter = [...emitterUser.transactions, newTransactionEmitter];
        
                        const valuesEmitter = { $set: { totalCash: Double(emitterUser.totalCash - amount) , transactions: transactionsEmitter }};

                        await encryptedUserColl.updateOne(queryEmitter, valuesEmitter , (err, result) => {

                            if (err && err.length) { 
                                res.json({ result: {}, error: 'No se pudo culminar la transacción, Por favor, intente de nuevo.'});
                            }
                            else {
                                res.json({ result: newTransaction , error:''});
                            }
                        });

                    }
                    else {
                        res.json({ result: {}, error: 'Hubo un problema con los datos del receptor. Por favor, intente de nuevo.'});
                    }
                    
                }
                else {
                    res.json({ result: {} , error: 'No se pudo realizar la transacción, Por favor, intente de nuevo.'});
                }
    
            }
            else {
                res.json({ result: {} , error: 'El usuario no se encuentra registrado en la base de datos.'});
            }
            
        }
        catch(e) {
           res.json({ result: {}, error: e.message});
        }
    };

    return {
        get_,
        getById_,
        getByIdUnencrypted_,
        delete_,
        post_,
        put_,
        transaction_,
        transactions_,
    };
};

module.exports = {
  factoryController,
};