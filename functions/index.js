const { onRequest } = require("firebase-functions/v2/https");
// Tester
exports.tester = onRequest(async (request, response) => {
    return response.sendStatus(200);
});