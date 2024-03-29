var restify = require('restify');
var builder = require('botbuilder');
var luis = require('./controller/LuisDialog');
var cards = require('./controller/cardCreator');
//var cognitive = require('./controller/CognitiveDialog');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3977, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: 'bb7e055c-5ea7-4351-9765-f78596816aca',
    appPassword: 'ekBJV78((urdsrCUSE768(*'
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Receive messages from the user
var bot = new builder.UniversalBot(connector, function (session) {
    
    session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);

});

bot.on('conversationUpdate', function(message,session){
    if(message.membersAdded){
        message.membersAdded.forEach(function(identity){
            if(identity.id === message.address.bot.id){
                var card = cards.createHeroCard(session, null, null);
                var respondToUser = new builder.Message(session).address(message.address).addAttachment(card);            
                bot.send(respondToUser); 


                //var reply = new builder.Message().address(message.address).text("Hi! I'm TT. I can currently help you with Account Summary and Ordering Foreign Currency");
                //bot.send(reply);
            }
        });
    }
})



//bot.set('persistUserData', false);

// This line will call the function in your LuisDialog.js file
luis.startDialog(bot);