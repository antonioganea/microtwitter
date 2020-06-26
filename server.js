
const express = require('express')
const app = express()
const port = 80

const fs = require('fs');


var data_dir = './data';
if (!fs.existsSync(data_dir)){
    fs.mkdirSync(data_dir);
}

const dateFormat = require('dateformat');

var bodyParser = require('body-parser');

const MAX_TWEETS = 5;

function initEmptyFile(fname){
    fs.writeFile(fname, "{}", (err) => {
        if (err) console.log(err);
        console.log("inited empty file " + fname);
      });
}

var tweets = [];
var highestID = 1003;

function loadTweets(){
    fs.readFile("data/tweets.txt", function(err, buf) {
        if ( err ){
            initEmptyFile("data/tweets.txt")
            return;
        }
        let data = JSON.parse(buf.toString());
        tweets = data.tweets || [];
        highestID = data.highestID || 1003;
        //console.log(buf.toString());
        console.log("Loaded tweets. Highest id " + highestID);
        //console.log(data);
    });
}
loadTweets();

var accounts = [];

function loadAccounts(){
    fs.readFile("data/accounts.txt", function(err, buf) {
        if ( err ){
            initEmptyFile("data/accounts.txt")
            return;
        }
        let data = JSON.parse(buf.toString());
        accounts = data.accounts || [];
        console.log("Loaded accounts. count : " + accounts.length);
    });
}
loadAccounts();

function saveAccounts(){
    let data = JSON.stringify({accounts:accounts});
    //console.log(data);
    fs.writeFile("data/accounts.txt", data, (err) => {
        if (err) console.log(err);
        //console.log("inited empty file " + fname);
      });
}

function accountExists(username){
    let exists = false;
    accounts.forEach(acc => {
        if ( acc.user == username ){
            exists = true;
        }
    });
    return exists;
}

function createUserAccount(user,pass){
    accounts.push({user:user,pass:pass});
    saveAccounts();
}

function registerUser(user,pass){
    let accExist = accountExists(user)
    if ( !accExist ){
        createUserAccount(user,pass);
        return true;
    } else {
        return false;
    }
}

function auth(user,pass){
    let authed = false;
    accounts.forEach(acc => {
        if ( acc.user === user ){
            if (acc.pass === pass){
                authed = true;
            }
        }
    });
    return authed;
}

function saveTweets(){
    let data = JSON.stringify({tweets:tweets,highestID:highestID});
    //console.log(data);
    fs.writeFile("data/tweets.txt", data, (err) => {
        if (err) console.log(err);
        //console.log("inited empty file " + fname);
      });
}

function generateID(){
    highestID+=1;
    return highestID;
}

function pushTweet(tweet){
    let id = generateID();
    tweet.id = id;
    tweets.unshift(tweet);
    while(tweets.length > MAX_TWEETS){
        tweets.pop()
    }
    saveTweets();
    return id;
}

function deleteTweet(id){
    tweets = tweets.filter(tweet => tweet.id !== id);
    saveTweets();
}

function editTweet(id,text){
    tweets.forEach(tweet => {
        if ( tweet.id === id ){
            tweet.text = text;
            saveTweets();
        }
    });
}

/*
pushTweet({
    user:"marco",
    text:"Mamma mia!",
    date:"a while back"
});
*/

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
    let ok = registerUser(req.body.user,req.body.pass)
    console.log("Register " + ok)
    res.json({ok:ok, user:req.body.user, pass:req.body.pass});
})

app.get('/smoketest', (req,res)=>{
    res.json({hey:"hello"})
})

app.use('/static', express.static('public'))

app.listen(port, () => console.log(`Serving at http://localhost:${port}`))
