var express= require("express");
var app = express();
var imageApi = require("./imageapi");
var mongoUrl = "mongodb://localhost:27017/imagesearch";
var mongo = require("mongodb").MongoClient;

app.use("/", express.static(__dirname + "/public"));
app.use(function(req,res){
   if(req.url.indexOf("/api/search/") === 0){
       var userInput = req.url.substring(12);
       var searchQuery = userInput.indexOf("?") >-1 ?  userInput.split("?")[0] : userInput;
       if(userInput.indexOf("?") >-1){
           var searchQuery = userInput.split("?")[0];
           var offsetNumber = Number(userInput.split("?")[1].substring(7));
       } else {
           var searchQuery = userInput;
           var offsetNumber;
       }
       imageApi(searchQuery, function(data){
           var content = [];
           var outputContent = [];
           data.map(function(val,index){
                   content.push({
                       "name": val.name,
                       "thumbnail": val.thumbnailUrl,
                       "imageLink": val.contentUrl,
                       "source": val.hostPageDisplayUrl
                   });
               });
           if(offsetNumber === undefined){
               outputContent = content.slice();
           } else {
               for(var i=0;i<5;i++){outputContent[i] = content[5*offsetNumber + i];}
           }
           res.end(JSON.stringify(outputContent));
           mongo.connect(mongoUrl, function(err, db){
               if(err){throw err}
               var addImage = db.collection("recent");
               var date = new Date();
               addImage.insert({
                   "query": searchQuery.replace(/%20/g, " "),
                   "time": date.toISOString()
               }, function(err, record){
                   if(err){throw err}
                   console.log("New search");
                   db.close();
               });
           });
       });
   } else if (req.url.indexOf("/api/latest") === 0){
       mongo.connect(mongoUrl, function(err, db){
            if(err){throw err}
            var latest = db.collection("recent");
            latest.find({},{"_id":false},{limit: 5}).sort( { $natural: 1 } ).toArray(function(err, docs){
                if(err){throw err}
                res.end(JSON.stringify(docs.reverse()));
                db.close();
            });
       }); //mongo
   } else {
       res.redirect("/");
   }
});
app.listen(8080);
