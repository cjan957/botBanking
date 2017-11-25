//import botbuilder module
var builder = require('botbuilder');
var auth = require('./Authenticate');

//make this function visible so that it can be called from app.js
exports.startDialog = function (bot) {
    var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/ac73b2a7-14fe-4534-a4ec-28d8527564d2?subscription-key=e0f228eaadb545219d601b54398b824a&verbose=true&timezoneOffset=0&q=')
    bot.recognizer(recognizer);

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
            auth.authenticate(session, results.response); 
            session.endDialog();
        }
    ])

    bot.dialog('orderCurrency', function (session,args,next){
        var value;
        var unit;

        session.dialogData.args = args || {};    
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
    }).triggerAction({
        matches:'orderCurrency'
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
        function (session, results){
            console.log('in ask for currency');
            var cardTitle = "What currency do you want to order?";
            var card = createThumbnailCard(session, cardTitle);
            var message = new builder.Message(session).addAttachment(card);
            session.send(message);
        },
        function (session, results){
            session.conversationData["currency_symbol"] = results.response;
            session.beginDialog('askForAmount');
        },
        function(session,resuls){
            session.endDialogWithResult(results);
        }
    ])

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
