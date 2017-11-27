var rest = require('../API/Restclient');
var builder = require('botbuilder');

//var card = require('./cardCreator');

exports.queryExchangeRates = function exchangeQuery(session, symbol, amount){
    var url = "https://api.fixer.io/latest?base=NZD";
    rest.enquireExchange(session,url,symbol,amount, getRate);
};

function getRate(session, symbol, amount, apiResponse){
    console.log("Current Rate");
    console.log(symbol);
    var response = JSON.parse(apiResponse);

    var rate = response.rates;
    var rateValue

    if(symbol.toLowerCase() == "thb"){
        rateValue = rate.THB;
        session.conversationData.rates = rateValue;
    }
    else{
        rateValue = rate.AUD;
        session.conversationData.rates = rateValue;
    }

    //console.log('Rates is : %s', rateValue);
    //session.send("Rate is: %s", session.conversationData.rates);
    confirmExchangeOrder(session, symbol, amount, rateValue, session.conversationData.username);
};

function confirmExchangeOrder(session, symbol, amount, rateValue, username){
    var imageURL = "https://upload.wikimedia.org/wikipedia/commons/3/35/Human-emblem-money-blue-128.png";

    var amountToDeduct = amount / rateValue;
    amountToDeduct = Number(Math.round(amountToDeduct+'e2')+'e-2');
    session.conversationData.amountToDeduct = amountToDeduct;
    var message = "**Currency:** " + symbol + " \n\n **Amount to Order:** " + amount + " \n\n *Current Rate:* " + rateValue + "\n\n --- \n\n **Total:** $" + amountToDeduct +"\n\n";
    var card = createThumbnailCard(session, "Order Confirmation", "A fee of $5 applies (not included)", message, imageURL);
    var respondToUser = new builder.Message(session).addAttachment(card);
    session.send(respondToUser);
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
            builder.CardAction.imBack(session,"Confirm","Confirm"),
            builder.CardAction.imBack(session,"Cancel","Cancel")
        ]);
}
