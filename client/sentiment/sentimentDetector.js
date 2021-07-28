var Sentiment = require('sentiment');
var sentiment = new Sentiment();

function getSentiment(text) {
    return sentiment.analyze(text);
}

module.exports = { getSentiment }