var rest = require('../api/RestClient');
var builder = require('botbuilder');

exports.displayAccountInfo = function getAccountInfo(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getDataFromDB(session,url,username,handleAccountSummaryData);
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
        accountBalance = Number(Math.round(accountBalance+'e2')+'e-2');
        session.conversationData.firstName = firstName;
        var titleMsg = "Hi, " + firstName + "";
        var subtitleMsg = username;
        var textMsg = "Your available balance: $" + accountBalance + "";

        //NOTE: this image is free to be used/ modified
        var imageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Bank_Creative_Tail.svg/128px-Bank_Creative_Tail.svg.png";
        pushInfoToCard(session, titleMsg, subtitleMsg, textMsg, imageUrl);
    }
    else{
        session.send("The contosoID you provided could not be found");
        session.endConversation("For security reason, you will need to start over");
    }    
}

exports.getAccountBalanceAndUpdateBalance = function getAccountBalance(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getDataFromDB(session,url,username,completingTransaction);
}

function storeOrderInDB (session, id, username, currencySymbol, amountnz, amountforeign){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/orders';
    rest.storeOrder(session,url,id,username,currencySymbol,amountnz,amountforeign, confirmSuccess);
}

function confirmSuccess(session){
    console.log('Exchange completed successfully!');
}

function completingTransaction(message, session, username){
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
        var fees = 5;     
        currentBalance = Number(Math.round(currentBalance+'e2')+'e-2');  
        amountToDeduct = Number(Math.round(session.conversationData.amountToDeduct+'e2')+'e-2');  
        
        if(currentBalance > session.conversationData.amountToDeduct + 5){
            var updatedBalance = currentBalance - (amountToDeduct + fees);
            updatedBalance = Number(Math.round(updatedBalance+'e2')+'e-2');  

            rest.updateAccount(session,url,accountID,updatedBalance,displayDeductedResult);
            storeOrderInDB(session, accountID, username, session.conversationData.currencySymbol, amountToDeduct, session.conversationData.currencyAmount);

            session.send("All done! You will receive an email within 5 business days when your order is ready. Type 'my orders' to see all of your orders.");
            session.send("I'm still learning and want to know what you think! Type 'feedback' anytime to send a feedback :) ");
            session.endDialog();
        }
        else{
            session.send("Sorry, you do not have sufficient fund to complete this order. \n\n Your available Balance: **$ " + currentBalance + "** \n\n Amount to be deducted: **$ " + (amountToDeduct + fees) + "** ");
            session.endDialog();
        }
    }
    else{
        session.send("The contosoID you provided could not be found");
        session.endConversation("For security reason, you will need to start over");
    }
}

function displayDeductedResult(message,session,username){
    session.send("balance deducted successfully");
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
