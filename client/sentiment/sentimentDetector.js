var Sentiment = require('sentiment');
var sentiment = new Sentiment();

function getSentiment(text) {
    return sentiment.analyze(text).comparative
}

module.exports = { getSentiment }