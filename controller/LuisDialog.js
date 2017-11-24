//import botbuilder module
var builder = require('botbuilder');

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

    //random integer generator
    function randomNumber(min,max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max-min)) + min;
    }

}
