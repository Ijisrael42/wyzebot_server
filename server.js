﻿require('rootpath')();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const errorHandler = require('_middleware/error-handler');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

// api routes
app.use('/accounts', require('./accounts/accounts.controller'));
app.use('/customers', require('./customers/customer.controller'));
app.use('/services', require('./services/service.controller'));
app.use('/tutors', require('./tutors/tutor.controller'));
app.use('/products', require('./products/product.controller'));
app.use('/students', require('./students/student.controller')); 
app.use('/squads', require('./squads/squad.controller')); 
app.use('/files', require('./files/file.controller'));
app.use('/requests', require('./requests/requests.controller'));
app.use('/utensils', require('./utensils/utensil.controller'));
app.use('/washings', require('./washings/washing.controller'));
app.use('/wyzebots', require('./wyzebots/wyzebot.controller'));
// swagger docs route
app.use('/api-docs', require('_helpers/swagger'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? (process.env.PORT || 80) : 4000;
app.listen(port, () => {
    console.log('Server listening on port ' + port);
});
