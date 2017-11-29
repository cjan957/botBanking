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
    }
    else if(symbol.toLowerCase() == "usd"){
        rateValue = rate.USD;
    }
    else if(symbol.toLowerCase() == "jpy"){
        rateValue = rate.JPY;
    }
    else if(symbol.toLowerCase() == "eur"){
        rateValue = rate.EUR;
    }
    else if(symbol.toLowerCase() == "aud"){
        rateValue = rate.AUD;
    }

    session.conversationData.rates = rateValue;
    confirmExchangeOrder(session, symbol, amount, rateValue, session.conversationData.username);
};

function confirmExchangeOrder(session, symbol, amount, rateValue, username){
    var imageURL = "https://upload.wikimedia.org/wikipedia/commons/3/35/Human-emblem-money-blue-128.png";

    var amountToDeduct = amount / rateValue;
    amountToDeduct = Number(Math.round(amountToDeduct+'e2')+'e-2');
    amountToDeductPlusFee = amountToDeduct + 5;
    amountToDeductPlusFee = Number(Math.round(amountToDeductPlusFee+'e2')+'e-2');
    session.conversationData.amountToDeduct = amountToDeduct;
    var message = "Currency: " + symbol + " \n\n Amount to Order: " + amount + " \n\n Today's Exchange Rate:  " + rateValue + "\n\n --- \n\n Amount in NZD: $"+ amountToDeduct +" \n\n Fees: $5 \n\n --- \n\n Total: $" + (amountToDeductPlusFee) +"\n\n";
    var card = createThumbnailCard(session, "Order Confirmation", null, message, imageURL);
    var respondToUser = new builder.Message(session).addAttachment(card);
    session.send(respondToUser);
    session.send("Just a heads up that it will take 5 business days for your order to be ready")
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

