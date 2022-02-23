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
    const wyzebots = await db.Wyzebot.find();
    return wyzebots.map(x => basicDetails(x));
}

async function getAllActive() {
    const wyzebots = await db.Wyzebot.find({ status: "Enabled"});
    return wyzebots.map(x => basicDetails(x));
}

async function getById(id) {
    const wyzebot = await getWyzebot(id);
    return basicDetails(wyzebot);
}

async function create(params) {

    const wyzebot = new db.Wyzebot(params);
    wyzebot.verified = Date.now();

    await wyzebot.save();

    return basicDetails(wyzebot);
}

async function update(id, params) {
    const wyzebot = await getWyzebot(id);

    // copy params to wyzebot and save
    Object.assign(wyzebot, params);
    wyzebot.updated = Date.now();
    await wyzebot.save();

    return basicDetails(wyzebot);
}

async function _delete(id) {
    const wyzebot = await getWyzebot(id);
    await wyzebot.remove();
}

async function deletemany(req, res) {
    const params = req.body;

    for ( var i = 0; i < params.length; i++){
        const wyzebot = await getWyzebot(params[i]);
        fileService.deleteFile(wyzebot.file_id);

        // Deleting Wyzebot from linked Squad
        const squad = await db.Squad.findById(wyzebot.squad);
        if(squad){ 
            squad.wyzebots = squad.wyzebots.filter((el) => wyzebot.id !== el);
            await squad.save();
        }
    }
    await db.Wyzebot.deleteMany({ _id: { $in: params } });
}

// helper functions

async function getWyzebot(id) {
    if (!db.isValidId(id)) throw 'Wyzebot not found';
    const wyzebot = await db.Wyzebot.findById(id);
    if (!wyzebot) throw 'Wyzebot not found';
    return wyzebot;
}

function basicDetails(wyzebot) {
    const { id, name, image, power, squad, squad_name, file_id, created } = wyzebot;
    return { id, name, image, power, squad, squad_name, file_id, created };
}