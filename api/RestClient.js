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

exports.getAccount = function getAccount(session, url, username, callback){
    request.get(url,{'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function getResponse(err,res,body){
        if(err){
            console.log(err);
        }
        else{
            callback(body,session,username);
        }
    })
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
