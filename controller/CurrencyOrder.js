var rest = require('../api/RestClient');
var builder = require('botbuilder');
var random = require('./Random');

exports.cancelOrders = function cancelOrders(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/orders';
    rest.getDataFromDB(session, url, username, deletion);
}

exports.getOrders = function getOrders(session,username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/orders';
    rest.getDataFromDB(session, url, username, getOrderList);
}

function getOrderList(body,session,username){
    var orderList = JSON.parse(body);
    var orderCount = 0;
    var attachment = [];

    for(var i in orderList){
        //create a card for each of the order
        if(orderList[i].usernameOrdered == username){
            orderCount++;            
            var currency = orderList[i].currency;
            var amountNZD = orderList[i].amountNZD;
            var amountForeign = orderList[i].amountForeign;

            var title = "Order " + orderCount + ": " + currency + " " + amountForeign;
            var text = "Amount in NZD : $" + amountNZD;
            var image = "https://upload.wikimedia.org/wikipedia/commons/a/a1/2002_currency_exchange_AIGA_euro_money.png";

            var card = new builder.ThumbnailCard(session)
                .title(title)
                .text(text)
                .images([
                    builder.CardImage.create(session,image)])
            attachment.push(card)

        }
    }

    if(orderCount != 0){
        session.send("Here's your pending foreign currency order(s)");
        //Attach each card to the carousel and push it to the user
        var response = "You have " + orderCount + "order(s)";
        var message = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(attachment);
        session.send(message);   
        session.send("You should receive an email within 5 business days since the day you placed your order. No email? Pleaes contact us.");

        //shows this randomly
        if(random.randomNumber(0,2) == 0){
            session.endDialog("TIP: I can cancel all your foreign currency orders in just a few steps. Just tell me.")
        }     
    }
    else{
        session.endDialog("You do not have any foreign currency orders. If you want to order one, just let me know!");
    }

}

function deletion(body, session, username){
    var url = 'https://contosobotbankingmobile.azurewebsites.net/tables/orders';
    var orderList = JSON.parse(body);

    for(var i in orderList){
        if(orderList[i].usernameOrdered == username){
            console.log(orderList[i].id);
            rest.deleteOrder(session,url,orderList[i].id,confirmDeleted);
        }
    }
}

function confirmDeleted(body,session,callback){
    console.log('deleted');
}