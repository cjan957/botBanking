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

    bot.dialog('orderCurrency', [function (session,args,next){
        //Check if logged in
        session.dialogData.args = args || {};
        if(!session.conversationData["username"]){
            session.beginDialog('authenticate');
        }
        else{
            next();
        }
    },
    function(session,results,next){
        if(!session.conversationData["username"]){
                session.send("Username was not found");
        }
        else{
            var currency = builder.EntityRecognizer.findEntity(session.dialogData.args.intent.entities, 'builtin.currency');
            if(currency){
                var value = currency.resolution.value;
                var unit = currency.resolution.unit;

                if(value == null && unit != null){
                    session.send("Please specify the amount of %s you want to order", unit);
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
                session.send("put amount AND currency");
            }
        }
    }]).triggerAction({
        matches:'orderCurrency'
    })




    //random integer generator
    function randomNumber(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }

  
}
