var rest = require('../api/RestClient');

exports.displayAccountInfo = function getAccountInfo(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/customer';
    rest.getAccount(session,url,username,handleAccountSummaryData);
}

function handleAccountSummaryData(message, session, username) {
    var firstName; 
    var accountBalance;

    var userList = JSON.parse(message);
    for (var index in userList) {
        var usernameReceived = userList[index].username;
        if (username.toLowerCase() === usernameReceived.toLowerCase()) {
            firstName = userList[index].firstname;
            accountBalance = userList[index].balance;
            
        }        
    }
    
    //make a card and send it!

    session.send("%s, your favourite foods are: %s", username, allFoods);                
    
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
            builder.CardAction.imBack(session,"Australian Dollar","Australian Dollar"),
            builder.CardAction.imBack(session,"Thai Baht","Thai Baht")
        ]);
}
