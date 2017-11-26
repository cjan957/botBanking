var request = require('request');

exports.checkUsername = function checkUsername(session, url, username){
    //var result = 0;
    request.get(url,{'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function getResponse(err,res,body){
        if(err){
            console.log(err);
        }
        else{
            //callback(body,session,username);
            var userList = JSON.parse(body);
            //console.log(userList);
            for (var i in userList){
                var usernameFromDB = userList[i].username;
                console.log(usernameFromDB);
                if(username.toLowerCase() == usernameFromDB.toLowerCase()){
                    //session.conversationData["username"] = usernameFromDB;
                }
            }
        }
    })
    //console.log('restclient result: %d',result);
    //return result;
}

exports.getAccount = function getAccount(session,url,username,callback){
    request.get(url,{'headers':{'ZUMO-API-VERSION': '2.0.0'}}, function getResponse(err,res,body){
        if(err){
            console.log(err);
        }
        else{
            callback();
        }
    })
}