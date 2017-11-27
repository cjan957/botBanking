var rest = require('../api/RestClient');
var builder = require('botbuilder');

exports.displayAccountInfo = function getAccountInfo(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getAccount(session,url,username,handleAccountSummaryData);
}


exports.getAccountBalanceAndUpdateBalance = function getAccountBalance(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getAccount(session,url,username,determineID);
}

function determineID(message, session, username){
    var accountID;
    var currentBalance;
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';

    var userList = JSON.parse(message);
    for(var index in userList){
        var usernameReceived = userList[index].username;
        if(username.toLowerCase() === usernameReceived.toLowerCase()){
            accountID = userList[index].id;
            currentBalance = userList[index].balance;
            break;
        }
    }
    if(accountID){
        if(currentBalance > session.conversationData.amountToDeduct + 5){
            var updatedBalance = currentBalance - (session.conversationData.amountToDeduct + 5);
            rest.updateAccount(session,url,accountID,updatedBalance,displayDeductedResult);
        }
        else{
            session.send("not enough fund");
        }
    }
    else{
        session.send("no account found");
    }
}

function displayDeductedResult(message,session,username){
    session.send("balance deducted successfully");
}

function handleAccountSummaryData(message, session, username) {
    var firstName; 
    var accountBalance;
    var found = null;

    var userList = JSON.parse(message);
    for (var index in userList) {
        var usernameReceived = userList[index].username;
        if (username.toLowerCase() === usernameReceived.toLowerCase()) {
            firstName = userList[index].firstName;
            accountBalance = userList[index].balance;
            found = true;
            break; 
        }        
    }

    if(found){
        var titleMsg = "Hi, " + firstName + "";
        var subtitleMsg = username;
        var textMsg = "Your available balance: $" + accountBalance + "";
        //NOTE: this image is free to be used/ modified
        var imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bank_Creative_Tail.svg/128px-Bank_Creative_Tail.svg.png";

        pushInfoToCard(session, titleMsg, subtitleMsg, textMsg, imageUrl);
    }
    else{
        session.send("The username you provided could not be found");
        session.endConversation("For security reason, you will need to start over");
    }

    //session.send("%s, your favourite foods are: %s", username, allFoods);                
    
}

function pushInfoToCard(session, cardTitle, subtitle, message, imageURL){
    var card = createThumbnailCard(session,cardTitle, subtitle,message,imageURL);
    var responseToUser = new builder.Message(session).addAttachment(card);
    session.send(responseToUser).endDialog();
}




function createThumbnailCard(session, cardTitle,subtitle, message, imageURL){
    return new builder.ThumbnailCard(session)
        .title(cardTitle)
        .subtitle(subtitle)
        .text(message)
        .images([
            builder.CardImage.create(session, imageURL)
        ])
        .buttons([
            //builder.CardAction.imBack(session,"Australian Dollar","Australian Dollar"),
            //builder.CardAction.imBack(session,"Thai Baht","Thai Baht")
        ]);
}
