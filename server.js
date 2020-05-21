
const express = require('express')
const app = express()
const port = 80

const fs = require('fs');
const dateFormat = require('dateformat');

var bodyParser = require('body-parser');


var tweets = [];
var highestID = 1003;

function generateID(){
    highestID+=1;
    return highestID;
}

function pushTweet(tweet){
    let id = generateID();
    tweet.id = id;
    tweets.unshift(tweet);
    return id;
}

function deleteTweet(id){
    tweets = tweets.filter(tweet => tweet.id !== id);
}

function editTweet(id,text){
    tweets.forEach(tweet => {
        if ( tweet.id === id ){
            tweet.text = text;
        }
    });
}

pushTweet({
    user:"marco",
    text:"Mamma mia!",
    date:"a while back"
});


let indexHTML = null;

function loadIndexHTML() {
    fs.readFile("index.html", function (err,data) {
        if (err) {
        console.error("Couldn't find index.html");
        return;
        }
        indexHTML = data;
    });
}
loadIndexHTML();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/unit', (req, res) => res.send('Hello World!'))

app.get('/latest', (req,res) => res.send({ok:true,tweets:tweets}));

app.get('/', (req,res) => {
    /* // Final version
    if ( indexHTML ) {
        res.writeHead(200);
        res.end(indexHTML);
    }
    else {
        res.writeHead(404);
        res.end("Error loading index.html");
        return;
    }
    */

    // Dev version for hot reloading
    fs.readFile("index.html", function (err,data) {
        if (err) {
        console.error("Couldn't find index.html");
        return;
        }
        res.writeHead(200);
        res.end(data);
    });
})

function auth(user,pass){
    if ( user == "antonio" && pass == "pass" ) {
        return true;
    } else {
        return false;
    }
}

app.post('/login', (req,res) => {
    //console.log(req.body);
    let user = req.body.user;
    let pass = req.body.pass;
    let ok = auth(user,pass);
    res.json({ok:ok, user:user, pass:pass});
})

app.post('/postTweet', (req,res) => {
    console.log(req.body);
    let user = req.body.user;
    let pass = req.body.pass;
    let text = req.body.text;
    let ok = auth(user,pass);
    let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");
    if ( ok === false ){
        res.json({ok:false})
        return;
    }
    let id = pushTweet({
        user:user,
        date:date,
        text:text
    })
    res.json({ok:ok,
        user:user,
        date:date,
        text:text,
        id:id
    });
})

app.put('/editTweet', (req,res) => {
    console.log(req.body);
    let user = req.body.user;
    let pass = req.body.pass;
    let text = req.body.text;
    let id = req.body.id;
    let ok = auth(user,pass);
    let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");
    if ( ok === false ){
        res.json({ok:false})
        return;
    }
    res.json({ok:ok, user:user, date:date, text:text});
    editTweet(id, text);
})

app.delete('/deleteTweet',(req,res)=>{
    console.log(req.body);
    let user = req.body.user;
    let pass = req.body.pass;
    let text = req.body.text;
    let id = req.body.id;
    let ok = auth(user,pass);
    let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");
    if ( ok === false ){
        res.json({ok:false})
        return;
    }
    res.json({ok:ok, user:user, date:date, text:text});
    deleteTweet(id);
})

app.post('/register', (req,res) => {
    console.log(req.body);
    res.json({ok:true, user:req.body.user, pass:req.body.pass});
})

app.get('/smoketest', (req,res)=>{
    res.json({hey:"hello"})
})

app.use('/static', express.static('public'))

app.listen(port, () => console.log(`Serving at http://localhost:${port}`))
