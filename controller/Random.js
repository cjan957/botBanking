//Helps with the randomness of the conversation

exports.randomNumber = function randomNumber(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max-min)) + min;
} 