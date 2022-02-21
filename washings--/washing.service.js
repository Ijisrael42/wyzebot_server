const db = require('_helpers/db');

module.exports = {
    getAll,
    getAllActive,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll() {
    const washings = await db.Washing.find();
    return washings.map(x => basicDetails(x));
}

async function getAllActive() {
    const washings = await db.Washing.find({ status: "Enabled"});
    return washings.map(x => basicDetails(x));
}

async function getById(id) {
    const washing = await getWashing(id);
    return basicDetails(washing);
}

async function create(params) {

    const washing = new db.Washing(params);
    washing.verified = Date.now();

    await washing.save();

    return basicDetails(washing);
}

async function update(id, params) {
    const washing = await getWashing(id);

    // copy params to washing and save
    Object.assign(washing, params);
    washing.updated = Date.now();
    await washing.save();

    return basicDetails(washing);
}

async function _delete(id) {
    const washing = await getWashing(id);
    await washing.remove();
}

// helper functions

async function getWashing(id) {
    if (!db.isValidId(id)) throw 'Washing not found';
    const washing = await db.Washing.findById(id);
    if (!washing) throw 'Washing not found';
    return washing;
}

function basicDetails(washing) {
    const { _id, id, name, utensil, quantity, customer, created } = washing;
    return { _id, id, name, utensil, quantity, customer, created };
}