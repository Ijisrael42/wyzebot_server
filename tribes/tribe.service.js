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
    const tribes = await db.Tribe.find();
    return tribes.map(x => basicDetails(x));
}

async function getAllActive() {
    const tribes = await db.Tribe.find({ status: "Enabled"});
    return tribes.map(x => basicDetails(x));
}

async function getById(id) {
    const tribe = await getTribe(id);
    return basicDetails(tribe);
}

async function create(params) {

    const tribe = new db.Tribe(params);
    tribe.verified = Date.now();

    await tribe.save();

    // Add Tribe to linked Tribes
    addSquads(tribe);
    return basicDetails(tribe);
}

async function update(id, params) {
    const tribe = await getTribe(id);

    // Delete Tribe from linked Squads
    deleteSquads(tribe.squads);

    // copy params to tribe and save
    Object.assign(tribe, params);
    tribe.updated = Date.now();
    await tribe.save();

    // Add Tribe to linked Squads
    addSquads(tribe);

    return basicDetails(tribe);
}

async function _delete(id) {
    const tribe = await getTribe(id);
    await tribe.remove();
}

async function deletemany(req, res) {
    const params = req.body;

    for ( var i = 0; i < params.length; i++){
        const tribe = await getTribe(params[i]);

        // Delete Tribe from linked Squads
        deleteSquads(tribe.squads);        
    }

    await db.Tribe.deleteMany({ _id: { $in: params } });
}

// Add Tribe to linked Squads
async function addSquads(tribe) {
    let squad = null;

    for( var i = 0; i < tribe.squads.length; i++ ) {
        squad = await db.Squad.findById(tribe.squads[i]);
        if(squad) {
            squad.tribe = tribe.id;
            squad.tribe_name = tribe.name;
            await squad.save();
        }
    }

}

// Delete Tribe from linked Squads
async function deleteSquads(squads) {

    let squad = null;

    // Delete Tribe from linked Squads
    for ( var i = 0; i < squads.length; i++){
        squad = await db.Squad.findById(squads[i]);
        if(squad) {
            squad.tribe = "";
            squad.tribe_name = "";
            await squad.save();
        }
    }
}

// helper functions

async function getTribe(id) {
    if (!db.isValidId(id)) throw 'Tribe not found';
    const tribe = await db.Tribe.findById(id);
    if (!tribe) throw 'Tribe not found';
    return tribe;
}

function basicDetails(tribe) {
    const { id, name, squads, created } = tribe;
    return { id, name, squads, created };
}