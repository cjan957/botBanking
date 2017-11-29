var builder = require('botbuilder');

//Welcome card
exports.createHeroCard = function welcomeMessage(session, title, image) {
    return new builder.ThumbnailCard(session)
        .title("Hi I'm TT")
        .subtitle("I can currently help you with **account summary**, **placing and cancelling foreign currency orders**. If you need help, just type 'help' anytime. ")
        .images([
            builder.CardImage.create(session, 'http://www.publicdomainpictures.net/pictures/180000/velka/robot-69.jpg')
        ])
}

exports.createThumbnailCard = function currenciesChoices(session, cardTitle){
    return new builder.ThumbnailCard(session)
        .title(cardTitle)
        .buttons([
            builder.CardAction.imBack(session,"AUD","Australian Dollar (AUD)"),
            builder.CardAction.imBack(session,"EUR","Euro (EUR)"),
            builder.CardAction.imBack(session,"JPY","Japanese Yen (JPY)"),                
            builder.CardAction.imBack(session,"USD","US Dollar (USD)")        
        ]);
}