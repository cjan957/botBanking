var builder = require('botbuilder');


exports.createHeroCard = function createHeroCard(session, title, image) {
    return new builder.ThumbnailCard(session)
        .title("Hi I'm TT")
        .subtitle("I can currently help you with Account summary and foreign currencies ordering. If you need help, type 'help' anytime. ")
        .images([
            builder.CardImage.create(session, 'http://www.publicdomainpictures.net/pictures/180000/velka/robot-69.jpg')
        ])
}