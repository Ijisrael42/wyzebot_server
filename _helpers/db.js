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
    Squad: require('squads/squad.model'),
    Tribe: require('tribes/tribe.model'),
    Wyzebot: require('wyzebots/wyzebot.model'),
    isValidId
};

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}