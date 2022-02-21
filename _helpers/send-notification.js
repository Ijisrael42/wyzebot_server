const admin = require("firebase-admin");
const serviceAccount = require("service-account.json");
const accountService = require('accounts/account.service');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-f2acb.firebaseio.com"
});

module.exports = sendNotification;

async function sendNotification(msg, title, regIdArray, accountId, url) {
    const clickAction =  url ? url : '/';
    const notification = { "body": msg, "title": title };
    const data = { "body": msg, "title": title, "click_action": clickAction };

    // web push notification data
    let messageData = { "data": data, "token": regIdArray }, res;

    res = admin.messaging().send(messageData)
    .then((response) => {  console.log(response); return response; })
    .catch((err) => { console.log(err); accountService.update(accountId, { device_token: "" }); });

    // hybrid/native push notification data
    messageData.notification = notification;
    res = admin.messaging().send(messageData)
    .then((response) => {  console.log(response); return response; })
    .catch((err) => { console.log(err); accountService.update(accountId, { device_token: "" }); });

    return res;
}
