const db = require('_helpers/db');
const sendNotification = require('_helpers/send-notification');
const accountService = require('accounts/account.service');

module.exports = {
    getAll,
    getByUserId,
    getBySupplierId,
    getBySupplierStatusId,
    getByParams,
    getById,
    create,
    update,
    delete: _delete,
};

async function getAll() {
    const washings = await db.Washing.find().sort({ created: -1});
    return washings.map(x => basicDetails(x));
}

async function getByUserId(id) {
    const washings = await db.Washing.find({ user_id: id}).sort({ created: -1});
    return washings.map(x => basicDetails(x));
}

async function getBySupplierId(id) {
    const washings = await db.Washing.find({ supplier_id: id}).sort({ created: -1});
    return washings.map(x => basicDetails(x));
}

async function getBySupplierStatusId(params) {
    const washings = await db.Washing.find({ supplier_id: params.id, status: params.status}).sort({ created: -1});
    return washings.map(x => basicDetails(x));
}

async function getItems(id) {
    const washings = await db.WashingItem.find({ washing_id: id});
    return washings.map(x => basicItemDetails(x));
}

async function getById(id) {
    const washing = await getWashing(id);
    const items = await getItems(id);
    return { ...basicDetails(washing), products: items};
}

async function getByParams(params) {
    const washings = await db.Washing.find(params).sort({ created: -1});
    return washings.map(x => basicDetails(x));
}

async function create(params) {

    const washing = new db.Washing(params);
    let washingItem = {};
    washing.verified = Date.now();

    await washing.save();
    
    params.items.forEach(item => {
        washingItem = new db.WashingItem({...item, washing_id: washing.id});
        washingItem.save();
    });

    return basicDetails(washing);
}

async function update(id, params) {
    const washing = await getWashing(id);

    if( params.status === 'Accepted' || params.status === 'Arrived' || params.status === 'Completed' ) {

        let msg = '';
        let title = '';
        // const account = accountService.getById(washing.user_id);
        const account = await db.Account.findById(washing.user_id);

        if( params.status === 'Accepted') {
            msg = 'Your Service Washing has been Accepted!!';
            title = 'Service Washing Accepted';
        }
        else if( params.status === 'Arrived') {
            msg = 'Your Service Provider has just arrived!';
            title = 'Service Provider Arrival';
        }
        else if( params.status === 'Completed') {
            msg = 'Your Service Washing has been Completed!! Rate your Service Provider';
            title = 'Service Washing Completed';
        }

        if( account.device_token ) {

            res = sendNotification(msg, title, account.device_token, account.id, `/washing/${id}`); 
            // console.log("sent!!", account.device_token);
        }
        else {} // Send an email notifying the Tutor about the notification.
    }

    // copy params to washing and save
    Object.assign(washing, params);
    washing.updated = Date.now();
    await washing.save();

    const response = await getById(id);
    return response;
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
    const { id, _id, name, customer, created } = washing;
    return { id, _id, name, customer, created };
}

function basicItemDetails(washing) {
    const { id, _id, price, utensil_id, utensil_name, quantity, created } = washing;
    return { id, _id, price, utensil_id, utensil_name, quantity, created };
}