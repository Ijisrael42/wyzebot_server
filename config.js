const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    connectionString: process.env.MONGODB_CONNECTIONSTRING,
    secret: process.env.SECRET
};