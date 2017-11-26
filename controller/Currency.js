var rest = require('../API/Restclient');

exports.queryExchangeRates = function exchangeQuery(session, symbol){
    var url = "https://api.fixer.io/latest?base=NZD";
    rest.enquireExchange(session,url,symbol,calculateFinal);
};

function calculateFinal(session, symbol, apiResponse){
    console.log("Current Rate");
    console.log(symbol);
    var response = JSON.parse(apiResponse);


    var rate = response.rates;
    var rateValue

    if(symbol.toLowerCase() == "thb"){
        var rateValue = rate.THB;
    }
    else{
        var rateValue = rate.AUD;
    }



    //console.log('Rates is : %s', rateValue);
    session.send("Rate is: %s", rateValue);
}

