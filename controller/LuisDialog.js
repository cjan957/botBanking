//import botbuilder module
var builder = require('botbuilder');
var auth = require('./Authenticate');

//make this function visible so that it can be called from app.js
exports.startDialog = function (bot) {
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ac73b2a7-14fe-4534-a4ec-28d8527564d2?subscription-key=e0f228eaadb545219d601b54398b824a&verbose=true&timezoneOffset=0&q=')
    bot.recognizer(recognizer);

    /*
    bot.dialog('firstRun', [
        function(session,next){
            session.userData.firstRun = true;
            builder.Prompts.text(session, "Please enter your username to continue");
        },
        function(session,results){
            session.conversationData.username = results.response;
        }
    ]).triggerAction({
        onFindAction: function(context,callback){
            if(!context.userData.firstRun){
                callback(null, 1.1);
            }
            else{
                callback(null, 0.0);
            }
        }    
    });
    */




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
                    var greetingMessage = "Good evening"
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
            session.send("Account summary coming soon!");
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
            if(results.response){
                currencyInfo.currency_amount = results.response;
            }
            session.send("So you would like to order %s %s", currencyInfo.currency_symbol,currencyInfo.currency_amount);
            builder.Prompts.text(session,'To confirm type "yes" or type "no" to cancel');
            //session.send("So you would like to buy %s %s. Is this correct?", currencyInfo.currency_symbol,currencyInfo.currency_amount);
        },
        function(session,results){
            if(results.response){
                if(results.response.toLowerCase() == "yes"){
                    console.log(session.conversationData.username)
                    //session.send(session.conversationData.username);
                    session.endDialog("OK order submitted");

                }
                else{
                    session.send(session.conversationData.username);
                    session.endDialog("OK Cancelled");

                }
            }
        }

        /*session.dialogData.args = args || {};    
        var currency = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'builtin.currency');
            if(currency){
                value = currency.resolution.value;
                unit = currency.resolution.unit;

                if(value == null && unit != null){
                    //session.send("Please specify the amount of %s you want to order", unit);
                    session.conversationData["currency_symbol"] = unit;
                    session.beginDialog('askForAmount');
                }
                else if(value != null && unit == null){
                    session.send("Please select the currency you want to buy from the options below");
                    session.send("xxxx,xxx");
                }
                else{
                    session.send("So you would like to buy %s %s. Is this correct?", value,unit);
                }
            }
            else{
                session.beginDialog('askForCurrency');
                //unit = results.response;
                //session.beginDialog('askForAmount');
                //value = results.reponse;
            }
            */
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

  
}
