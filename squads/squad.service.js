const db = require('_helpers/db');
const fileService = require('../files/file.service');

module.exports = {
    getAll,
    getAllActive,
    getById,
    create,
    update,
    delete: _delete,
    deletemany,
};

async function getAll() {
    const squads = await db.Squad.find();
    return squads.map(x => basicDetails(x));
}

async function getAllActive() {
    const squads = await db.Squad.find({ status: "Enabled"});
    return squads.map(x => basicDetails(x));
}

async function getById(id) {
    const squad = await getSquad(id);
    return basicDetails(squad);
}

async function create(params) {

    const squad = new db.Squad(params);
    squad.verified = Date.now();

    await squad.save();

    return basicDetails(squad);
}

async function update(id, params) {
    const squad = await getSquad(id);

    // copy params to squad and save
    Object.assign(squad, params);
    squad.updated = Date.now();
    await squad.save();

    return basicDetails(squad);
}

async function _delete(id) {
    const squad = await getSquad(id);
    await squad.remove();
}

async function deletemany(req, res) {
    const params = req.body;

    for ( var i = 0; i < params.length; i++){
        const squad = await getSquad(params[i]);
        fileService.deleteFile(squad.file_id);
    }
    await db.Squad.deleteMany({ _id: { $in: params } });
}

// helper functions

async function getSquad(id) {
    if (!db.isValidId(id)) throw 'Squad not found';
    const squad = await db.Squad.findById(id);
    if (!squad) throw 'Squad not found';
    return squad;
}

function basicDetails(squad) {
    const { id, name, wyzebot, tribe, created } = squad;
    return { id, name, wyzebot, tribe, created };
}