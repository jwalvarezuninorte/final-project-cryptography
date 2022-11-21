const express = require('express');
const router = express.Router();

const { factoryController } = require('../controllers/server.controller');

const factoryRouter = async (connections) => {

    const { get_,
            getById_,
            getByIdUnencrypted_,
            delete_,
            post_,
            put_,
            transaction_,
            transactions_ } = await factoryController(connections);

    //// User Routes ////////////////////////////////////////////////////////////////////////

    /* GET all users. */
    const get = router.get('/users', get_);

    /* GET user by id. */
    const getById = router.get('/users/:id', getById_);

    /* GET user by id with unencrypted data. */
    const getByIdUnencrypted = router.get('/users/:id/unencrypted', getByIdUnencrypted_);

    /* DELETE user by id. */
    const remove = router.delete('/users/:id', delete_);

    /* POST new user. */
    const post = router.post('/users', post_);

    /* PUT new user. */
    const put = router.put('/users', put_);

    //// Transaction Routes ///////////////////////////////////////////////////////////////

    /* GET all transactions. */
    const transactions = router.get('/transactions', transactions_);

    /* POST new transaction. */
    const transaction = router.post('/transaction', transaction_);

    return {
        get,
        getById,
        getByIdUnencrypted,
        post,
        put,
        remove,
        transaction,
        transactions
    };

};

module.exports = {
    factoryRouter,
}