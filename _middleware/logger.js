const fs = require("fs");
chalk = require('chalk');

const loggerHandler = (req, res, next) => { //middleware function
    let dateTime = new Date();
    let formatted_date = dateTime.getFullYear() + "-" + (dateTime.getMonth() + 1) + "-" + dateTime.getDate() + 
    " " + dateTime.getHours() + ":" + dateTime.getMinutes() + ":" + dateTime.getSeconds();
    
    let method = req.method, url = req.url, status = res.statusCode;
    const start = process.hrtime();
    const durationInMilliseconds = getActualRequestDurationInMilliseconds(start);
    let log = `[${chalk.blue(formatted_date)}] ${method}:${url} ${status} 
    ${chalk.red(durationInMilliseconds.toLocaleString() + "ms")}`;    
    console.log(log);

    fs.appendFile("request_logs.txt", log + "\n", err => { if (err) { console.log(err); } });
    next();
};

const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; //  convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

module.exports = loggerHandler;