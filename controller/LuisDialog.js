//import botbuilder module
var builder = require('botbuilder');
var auth = require('./Authenticate');
var account = require('./AccountSummary');
var currencyQuery = require('./Currency');

//make this function visible so that it can be called from app.js
exports.startDialog = function (bot) {
    //dreamspark (ran out of quota)
    //var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ac73b2a7-14fe-4534-a4ec-28d8527564d2?subscription-key=e0f228eaadb545219d601b54398b824a&verbose=true&timezoneOffset=0&q=')
    
    //freetrial 
    var recognizer = new builder.LuisRecognizer('https://southeastasia.api.cognitive.microsoft.com/luis/v2.0/apps/ac73b2a7-14fe-4534-a4ec-28d8527564d2?subscription-key=38af2bf700964332a6ea1874dca72a77&spellCheck=true&timezoneOffset=0&q=')
    bot.recognizer(recognizer);


    bot.dialog('displayWelcome', function(session,args){
        session.send("Hi! I'm TT. I can currently help you with Account Summary, Ordering Foreign Currency and Managing appointments");
        session.endDialog();
    }).triggerAction({
        //This will be trigger from menu options only
        matches: /^restartFromFailedUsername$/i
    })

    bot.dialog('receipt', function(session,args){
        var card = createReceiptCard(session);
        var responseToUser = new builder.Message(session).addAttachment(card);
        session.send(responseToUser).endDialog();
    }).triggerAction({
        //This will be trigger from menu options only
        matches: /^receipt$/i
    })

    bot.dialog('help', function(session,args){
        session.send("Things you can tell me... \n\n **My Account Summary** \n\n **I want to order foreign currency**");
        session.endDialog();
    }).triggerAction({
        matches: /^help$/i
    })

    bot.dialog('restart', function(session,args){
        session.endConversation();
    }).triggerAction({
        //This will be trigger from menu options only
        matches: /^restart$/i
    })

    //If the intent of the message is 'welcome', the bot should greet back to the user
    bot.dialog('greeting', function (session,args){
        //TODO: Check for attachment if necessary
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
                var greetingMessage = "Nice talking to you"
                break;
            }
            session.send(greetingMessage);
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
            var currency = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'builtin.currency');

            var currencyInfo = session.dialogData.currencyInfo = {
                currency_symbol: currency ? currency.resolution.unit : null,
                currency_amount: currency ? currency.resolution.value : null,
            };

            if(!currencyInfo.currency_symbol){
                session.beginDialog('askForCurrency');
            }
            else{
                //Check entities from LUIS and convert to the format bot code understands
                if(currencyInfo.currency_symbol == "United States dollar"){
                    currencyInfo.currency_symbol = "USD";
                    next();
                }
                else if(currencyInfo.currency_symbol == "Japanese yen"){
                    currencyInfo.currency_symbol = "JPY";
                    next();
                }
                else if(currencyInfo.currency_symbol == "Euro"){
                    currencyInfo.currency_symbol = "EUR";
                    next();
                }
                else if(currencyInfo.currency_symbol == "Australian dollar"){
                    currencyInfo.currency_symbol = "AUD";
                    next();
                }
                else if(currencyInfo.currency_symbol != null){
                    session.endDialog("I'm sorry but " +  currencyInfo.currency_symbol + " is not currently supported here. Please order it on our internet banking site");
                }
            }
        },
        function(session,results,next){
            var currencyInfo = session.dialogData.currencyInfo;
            if(results.response){
                currencyInfo.currency_symbol = results.response;
            }
            var unit = currencyInfo.currency_symbol;
            if(!currencyInfo.currency_amount){
                session.beginDialog('askHowMuch');
                //builder.Prompts.text(session,'OK, how much do you need?');
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

            session.sendTyping();
            builder.Prompts.text(session, "Let me put everything together..");
            
            currencyQuery.queryExchangeRates(session, session.conversationData.currencySymbol, session.conversationData.currencyAmount);    
            
        },
        function(session,results){
            if(results.response){
                console.log(results.response);
                if(results.response.toLowerCase() == "confirm"){
                    console.log(session.conversationData.username)

                    console.log(session.conversationData.currencySymbol);
                    console.log(session.conversationData.currencyAmount);

                    session.sendTyping();
                    account.getAccountBalanceAndUpdateBalance(session,session.conversationData.username);
                }
                else{
                    session.endDialog("Ok, I cancelled your order.");
                }
            }
        }

    ]).triggerAction({
        matches:'orderCurrency',
        confirmPrompt: "This will cancel the ordering of currency process. Are you sure?"
    })

    bot.dialog('askHowMuch', [
        function(session,args,next){
            if(args && args.reprompt){
                builder.Prompts.text(session, "Please specify how much (in numbers) you need without any symbols (. or , or $ etc)");
            }
            else{
                builder.Prompts.text(session,"OK, how much do you need?");
            }
        },
        function(session,results){
            var matched = results.response.match(/^\d+$/);
            if(matched){
                session.endDialogWithResult(results);
            }
            else{
                session.replaceDialog('askHowMuch',{reprompt : true});
            }
        }
    ]).triggerAction({
        matches: 'askHowMuch'
    })

    bot.dialog('askForCurrency', [
        function (session){
            var card = createThumbnailCard(session, "What currency do you want?");
            var respondToUser = new builder.Message(session).addAttachment(card);            
            session.send(respondToUser);            
            builder.Prompts.text(session, "Want something other than AUD, EUR, JPN or USD? Please use our internet banking to place your order.");
        },
        function (session, results){
            session.endDialogWithResult(results);
        },
    ]).beginDialogAction('askCurrencyHelpAction', 'askCurrency_Help', {matches: /^help$/i});

    bot.dialog('askCurrency_Help', function(session,args,next){
        var msg = "Supported currencies are : THB, USD, AUD etc";
        session.endDialog(msg);
    })

    function createThumbnailCard(session, cardTitle){
        return new builder.ThumbnailCard(session)
            .title(cardTitle)
            .buttons([
                builder.CardAction.imBack(session,"AUD","Australian Dollar (AUD)","AUD"),
                builder.CardAction.imBack(session,"EUR","Euro (EUR)"),
                builder.CardAction.imBack(session,"JPN","Japanese Yen (JPY)"),                
                builder.CardAction.imBack(session,"USD","US Dollar (USD)")        
            ]);
    }

    //random integer generator
    function randomNumber(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }
 
}
