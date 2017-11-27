//import botbuilder module
var builder = require('botbuilder');
var auth = require('./Authenticate');
var account = require('./AccountSummary');
var currencyQuery = require('./Currency');

//make this function visible so that it can be called from app.js
exports.startDialog = function (bot) {
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ac73b2a7-14fe-4534-a4ec-28d8527564d2?subscription-key=e0f228eaadb545219d601b54398b824a&verbose=true&timezoneOffset=0&q=')
    bot.recognizer(recognizer);


    bot.dialog('displayWelcome', function(session,args){
        session.send("Hi! I'm TT. I can currently help you with Account Summary, Ordering Foreign Currency and Managing appointments");
        session.endDialog();
    }).triggerAction({
        //This will be trigger from menu options only
        matches: /^restartFromFailedUsername$/i
    })

    //If the intent of the message is 'welcome', the bot should greet back to the user
    bot.dialog('greeting', function (session,args){
        //TODO: Check for attachment if necessary
        if(!checkIfEntityIsCurrency(session,args)){
            var greetingSelector = randomNumber(0,3); //0 1 or 2
            console.log('greetingSelector is : %d', greetingSelector);
            switch(greetingSelector){
                case 0:
                    var greetingMessage = "Hello there"
                    break;
                case 1:
                    var greetingMessage = "Hi"
                    break;
                case 2:
                    var greetingMessage = "Nice to be with you"
                    break;
            }
            session.send(greetingMessage);
        }
        else{
            session.send(":(");
            //session.endDialog();
            session.beginDialog('orderCurrency');
        }
        
    }).triggerAction({
        matches: 'greeting'
    });


    bot.dialog('authenticate',[
        function (session){
            builder.Prompts.text(session, "Please enter your username to continue");
        },
        function (session,results){
            session.conversationData.username = results.response;
            console.log("userdata should be saved");
            session.endDialog();
        }
    ]).triggerAction({
        matches: 'authenticate'
    });


    bot.dialog('accountSummary',[
        function(session,args,next){
            if(!session.conversationData.username){
                console.log(session.conversationData.username);
                session.beginDialog('authenticate');
            }
            else{
                next();
            }
        },
        function(session,args,next){
            //session.send("Please wait while we are retrieving your account..");
            session.sendTyping();
            account.displayAccountInfo(session,session.conversationData.username);
        }
        
    ]).triggerAction({
        matches: 'accountSummary'
    });

    bot.dialog('orderCurrency', [
        function(session,args,next){
            session.dialogData.args = args || {};
            if(!session.conversationData.username){
                session.beginDialog('authenticate');
            }
            else{
                next();
            }
        },
        
        function (session,args,next){
            //var intent = args.intent;
            //console.log(intent);
            var currency = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'builtin.currency');

            //value = currency.resolution.value;
            //unit = currency.resolution.unit;

            var currencyInfo = session.dialogData.currencyInfo = {
                currency_symbol: currency ? currency.resolution.unit : null,
                currency_amount: currency ? currency.resolution.value : null,
            };

            if(!currencyInfo.currency_symbol){
                session.beginDialog('askForCurrency');
                //builder.Prompts.text(session,'Please specify the currency');
            }
            else{
                next();
            }
        },
        function(session,results,next){
            var currencyInfo = session.dialogData.currencyInfo;
            if(results.response){
                currencyInfo.currency_symbol = results.response;
            }
            var unit = currencyInfo.currency_symbol;
            if(!currencyInfo.currency_amount){
                builder.Prompts.text(session,'How much would you like to order?');
                session.send("Currency: %s", currencyInfo.currency_symbol);
            }
            else{
                next();
            }
        },
        function(session,results,next){
            var currencyInfo = session.dialogData.currencyInfo;
            var been = false;
            if(results.response){
                currencyInfo.currency_amount = results.response;
            }
            session.conversationData.currencySymbol = currencyInfo.currency_symbol;
            session.conversationData.currencyAmount = currencyInfo.currency_amount;

            currencyQuery.queryExchangeRates(session, session.conversationData.currencySymbol, session.conversationData.currencyAmount);    
            session.sendTyping();
            builder.Prompts.text(session, 'Generating your order..');
        },
        function(session,results){
            if(results.response){
                console.log(results.response);
                if(results.response.toLowerCase() == "confirm"){
                    console.log(session.conversationData.username)

                    console.log(session.conversationData.currencySymbol);
                    console.log(session.conversationData.currencyAmount);

                    account.getAccountBalanceAndUpdateBalance(session,session.conversationData.username);
                    //session.send(session.conversationData.username);
                    //currencyQuery.queryExchangeRates(session, session.dialogData.currencyInfo.currency_symbol);

                    session.endDialog("OK order submitted");

                }
                else{
                    session.send(session.conversationData.username);
                    session.endDialog("OK Cancelled");

                }
            }
        }

    ]).triggerAction({
        matches:'orderCurrency',
        confirmPrompt: "This will cancel the ordering of currency process. Are you sure?"
    });


    bot.dialog('askForAmount',[
        function (session,results){
            builder.Prompts.text(session, "Please enter the amount of %s you want to buy", session.conversationData["currency_symbol"]);
        },
        function(session,results){
            session.conversationData["currency_amount"] = results.response;
            session.endDialogWithResult(results);
        }
    ])


    bot.dialog('waitForData', [
        function (session,results,next){
            currencyQuery.queryExchangeRates(session, session.conversationData.currencySymbol, session.conversationData.currencyAmount);    
        },
        function(session,results){
            session.endDialog();
        }
    ]).triggerAction({
        mathces: 'waitForData'
    })


    bot.dialog('askForCurrency', [
        function (session){            
            builder.Prompts.text(session, "What currency do you want to order?");
            session.send("For more info on what currencies are avaiable to be ordered. Type Help");
        },
        function (session, results){
            session.endDialogWithResult(results);
        },
    ])
    .beginDialogAction('askCurrencyHelpAction', 'askCurrency_Help', {matches: /^help$/i});

    bot.dialog('askCurrency_Help', function(session,args,next){
        var msg = "Supported currencies are : THB, USD, AUD etc";
        session.endDialog(msg);
    })

    function createThumbnailCard(session, cardTitle){
        return new builder.ThumbnailCard(session)
            .title(cardTitle)
            .buttons([
                builder.CardAction.imBack(session,"Australian Dollar","Australian Dollar"),
                builder.CardAction.imBack(session,"Thai Baht","Thai Baht")
            ]);
    }

    //random integer generator
    function randomNumber(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }


    function checkIfEntityIsCurrency(session,args){
        session.dialogData.args = args || {};  
        var currency = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'builtin.currency');
        if(currency){
            return 1;
        }   
        else{
            return 0;
        }     
    }


    bot.dialog('receipt', function(session,args){
        var card = createReceiptCard(session);
        var responseToUser = new builder.Message(session).addAttachment(card);
        session.send(responseToUser).endDialog();
    }).triggerAction({
        //This will be trigger from menu options only
        mathces: /^secretCodeABC123C$/i
    })

    function createReceiptCard(session){
        return new builder.ReceiptCard(session)
        .title('John Doe')
        .facts([
            builder.Fact.create(session, '1234', 'Order Number'),
            builder.Fact.create(session, 'VISA 5555-****', 'Payment Method')
        ])
        .items([
            builder.ReceiptItem.create(session, '$ 38.45', 'Data Transfer')
                .quantity(368)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png')),
            builder.ReceiptItem.create(session, '$ 45.00', 'App Service')
                .quantity(720)
                .image(builder.CardImage.create(session, 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png'))
        ])
        .tax('$ 7.50')
        .total('$ 90.95')
        .buttons([
            builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/pricing/', 'More Information')
                .image('https://raw.githubusercontent.com/amido/azure-vector-icons/master/renders/microsoft-azure.png')
        ]);
    }

  
}
