//This just checks whether or not a username the user provided exists
var rest = require('../api/RestClient');

exports.authenticate = function authenticate(session, username){
    var dbURL = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.checkUsername(session, dbURL, username);
}

