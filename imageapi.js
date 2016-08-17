var request = require('request');

module.exports = function(val, callback){
    var options = {
      url: 'https://api.cognitive.microsoft.com/bing/v5.0/images/search?q=' + val.replace(/%20/g, "+").replace(/\s/g, "+"),
      headers: {'Ocp-Apim-Subscription-Key': 'f865dc9cd42641e881275e1ab69893fd'}
    };
    request(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            callback(info.value);
        }
    });
}