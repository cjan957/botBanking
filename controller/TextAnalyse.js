var rest = require('../api/RestClient');
var builder = require('botbuilder');


exports.textAnalyse = function textAnalyse(session, username, message){
    var url = 'https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.0/sentiment';
    rest.analyseText(session, url, username, message, storeToDB);
}

function storeToDB (session, body, message, username){
    var url = "https://contosobotbankingmobile.azurewebsites.net/tables/feedback";    
    var sentimentScore = body.documents[0].score;
    var mood = 0;

    //Determine whether or not the user is happy with the service
    if(sentimentScore < 0.5){
        //user not happy
        mood = 0;
    }
    else{
        //user finds the bot ok
        mood = 1;
    }

    rest.storeFeedback(session, url, username, message, mood, confirmFeedbackReceived);
}

function confirmFeedbackReceived(session, mood){
    console.log("last step of feedback");
    if(mood == 0){
        session.send("I'm sorry that I wasn't so helpful. Your feedback will help me improve in the future! Thanks");
    }
    else if(mood == 1){
        session.send("Thank you for your feedback! I'm always happy to help");
    }
}
