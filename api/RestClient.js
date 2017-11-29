var request = require('request');

exports.enquireExchange = function getExchange(session, url, symbol, amount, callback){
    request.get(url, function(err,res,body){
        if(err){
            console.log(err);
        }else {
            callback(session, symbol, amount, body);
        }
    });
}

exports.getDataFromDB = function getDataFromDB(session, url, username, callback){
    request.get(url,{'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function getResponse(err,res,body){
        if(err){
            console.log(err);
        }
        else{
            callback(body,session,username);
        }
    });
}


exports.storeOrder = function storeOrder(session, url, id, username, currency, amount_nz, amount_foreign, callback){
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        },
        json: { //json Payload (body)
            "customerID" : id,
            "usernameOrdered" : username,
            "currency" : currency,
            "amountNZD" : amount_nz,
            "amountForeign" : amount_foreign
        }
    };
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) { //check if 200/ everything's ok
            callback(session);
        }
        else{
            console.log(error);
        }
    });
}

exports.updateAccount = function updateAccount(session,url,id,newbalance,callback){
    var options = {
        url: url,
        method: 'PATCH',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        },
        json: { //json Payload (body)
            "id" : id,
            "balance" : newbalance,
        }
    };
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) { //check if 200/ everything's ok
            console.log(body);
        }
        else{
            console.log(error);
        }
    });
}

exports.analyseText = function analyseText(session, url, username, message, callback){
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': '3e2219cedcb9447a8b69cd83ae50b67a',
            'Content-Type':'application/json'
        },
        json: { //json Payload (body)
            "documents": [
                {
                    "language": "en",
                    "id": "1",
                    "text": message
                }
            ]
        }
    };
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) { //check if 200/ everything's ok
            console.log(body);
            callback(session, body, message, username);
        }
        else{
            console.log(error);
        }
    });
}


exports.storeFeedback = function storeFB(session, url, username, message, mood, callback){
    var options = {
        url: url,
        method: 'POST',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        },
        json: { //json Payload (body)
            "fromUsername" : username,
            "message" : message,
            "happy" : mood //0 for unhappy, 1 for happy
        }
    };
    
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 201) { //check if 200/ everything's ok
            callback(session, mood);
        }
        else{
            console.log(error);
            console.log("soemthing wrong");
        }
    });
}


exports.deleteOrder = function deleteOrder(session, url, id, callback){
    var options = {
        url: url + "\\" + id + "?force=true",
        method: 'DELETE',
        headers: {
            'ZUMO-API-VERSION': '2.0.0',
            'Content-Type':'application/json'
        }
    };

    request(options,function (err, res, body){
        if(!err && res.statusCode === 200){
            console.log(body);
            callback(body,session,callback);
        }else {
            console.log(err);
            console.log(res);
        }
    })
}