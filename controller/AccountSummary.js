var rest = require('../api/RestClient');
var builder = require('botbuilder');

exports.displayAccountInfo = function getAccountInfo(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getAccount(session,url,username,handleAccountSummaryData);
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

        pushInfoToCard(session, titleMsg, subtitleMsg, textMsg, null);
    }
    else{
        session.send("The username you provided could not be found");
        session.endConversation("For security reason, please startover");
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
