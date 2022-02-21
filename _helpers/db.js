const config = require('config.json');
const mongoose = require('mongoose');
const connectionOptions = { useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false };
mongoose.connect( config.connectionString, connectionOptions);
mongoose.Promise = global.Promise;
const connection= mongoose.connection;

connection.once('open', () => {
    console.log("Mongodb database connection established successfully !!");
})

module.exports = {
    Account: require('accounts/account.model'),
    Customer: require('customers/customer.model'),
    Product: require('products/product.model'),
    RefreshToken: require('accounts/refresh-token.model'),
    Request: require('requests/request.model'),
    RequestItem: require('requests/request_item.model'),
    Service: require('services/service.model'),
    Tutor: require('tutors/tutor.model'),
    Student: require('students/student.model'),
    Utensil: require('utensils/utensil.model'),
    Washing: require('washings/washing.model'),
    WashingItem: require('washings/washing_item.model'),
    Wyzebot: require('wyzebots/wyzebot.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}