const db = require('../_helpers/db');

module.exports = { getAll, getById, create, update, delete: _delete, deletemany };

async function getAll() {
    const squads = await db.Squad.find();
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

    // Add Squad to linked Wyzebots
    addWyzebots(squad);
    return basicDetails(squad);
}

async function update(id, params) {
    const squad = await getSquad(id);

    // Delete Squad from linked Wyzebots
    deleteWyzebots(squad.wyzebots);

    // copy params to squad and save
    Object.assign(squad, params);
    squad.updated = Date.now();
    await squad.save();

    // Add Squad to linked Wyzebots
    addWyzebots(squad);

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

        // Delete Squad from linked Wyzebots
        deleteWyzebots(squad.wyzebots);

        // delete Squad from Tribe
        const tribe = await db.Tribe.findById(squad.tribe);
        if(tribe) {
            tribe.squads = tribe.squads.filter((el) => squad.id !== el);
            await tribe.save();
        }        
    }

    await db.Squad.deleteMany({ _id: { $in: params } });
}

// Add Squad to linked Wyzebots
async function addWyzebots(squad) {
    let wyzebot = null;

    for( var i = 0; i < squad.wyzebots.length; i++ ) {
        wyzebot = await db.Wyzebot.findById(squad.wyzebots[i]);
        if(wyzebot) {
            wyzebot.squad = squad.id;
            wyzebot.squad_name = squad.name;
            await wyzebot.save();
        }
    }

}

// Delete Squad from linked Wyzebots
async function deleteWyzebots(wyzebots) {

    let wyzebot = null;

    // Delete Squad from linked Wyzebots
    for ( var i = 0; i < wyzebots.length; i++){
        wyzebot = await db.Wyzebot.findById(wyzebots[i]);
        if(wyzebot) {
            wyzebot.squad = "";
            wyzebot.squad_name = "";
            await wyzebot.save();
        }
    }
}

// helper functions

async function getSquad(id) {
    if (!db.isValidId(id)) throw 'Squad not found';
    const squad = await db.Squad.findById(id);
    if (!squad) throw 'Squad not found';
    return squad;
}

function basicDetails(squad) {
    const { id, name, wyzebots, tribe, tribe_name, created } = squad;
    return { id, name, wyzebots, tribe, tribe_name, created };
}