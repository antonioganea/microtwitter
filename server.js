
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

/*
var tweets = [];
var highestID = 1003;
*/

function getTimeStamp() {
    let datetime = new Date();
    let timestamp = '[';
    timestamp += datetime.getDate().toString().padStart(2, '0') + '/';
    timestamp += (datetime.getMonth() + 1).toString().padStart(2, '0') + '/';
    timestamp += datetime.getFullYear() + ' ';
    timestamp += datetime.getHours().toString().padStart(2, '0') + ':';
    timestamp += datetime.getMinutes().toString().padStart(2, '0') + ':';
    timestamp += datetime.getSeconds().toString().padStart(2, '0') + ']';

    // Or alternatively, something like this:
    // let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");

    return timestamp;
}

// boot logger service
function logMessage( msg ){
    msg = getTimeStamp() + ' ' + msg + '\n';
    fs.appendFile('data/logs.txt', msg, function (err) {
        if ( err ){
            throw err;
        }
      });
}

/*
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
*/

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
        accounts.forEach(acc => {
            loadUserTweets(acc.user);
        });
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

    //create user tweet folder
    if (!fs.existsSync(data_dir + "/" + user)){
        fs.mkdirSync(data_dir + "/" + user);
    }

    initEmptyFile(data_dir + "/" + user + "/tweets.txt");
    usrTweets[user] = [];
    usrHighestID[user] = 1003;

    saveAccounts();
}

function registerUser(user,pass){
    let accExist = accountExists(user)
    if ( !accExist ){
        createUserAccount(user,pass);
        logMessage(`User '${user}' just registered.`);
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
/*
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
*/

let usrTweets = {}
let usrHighestID = {}

function generateIDforUser(user){
    usrHighestID[user]+=1;
    return usrHighestID[user];
}

function pushTweetforUser(user,tweet){
    let id = generateIDforUser(user);
    tweet.id = id;
    usrTweets[user].unshift(tweet);
    while(usrTweets[user].length > MAX_TWEETS){
        usrTweets[user].pop()
    }
    saveUserTweets(user);
    return id;
}

function deleteTweetforUser(user,id){
    usrTweets[user] = usrTweets[user].filter(tweet => tweet.id !== id);
    saveUserTweets(user);
}

function editTweetforUser(user,id,text, emoji){
    usrTweets[user].forEach(tweet => {
        if ( tweet.id === id ){
            tweet.text = text;
            tweet.emoji = emoji;
            saveUserTweets(user);
        }
    });
}

function loadUserTweets(user){
        fs.readFile( data_dir + "/" + user + "/tweets.txt", function(err, buf) {
            if ( err ){
                initEmptyFile("data/" + user +"/tweets.txt")
                return [];
            }
            let data = JSON.parse(buf.toString());
            usrTweets[user] = data.tweets || [];
            usrHighestID[user] = data.highestID || 1003;
            //console.log(buf.toString());
                    //console.log("Loaded tweets. Highest id " + highestID);
            //console.log(data);
        });
}

function saveUserTweets(user){
    let data = JSON.stringify({tweets:usrTweets[user],highestID:usrHighestID[user]});
    //console.log(data);
    fs.writeFile("data/" + user +"/tweets.txt", data, (err) => {
        if (err) console.log(err);
        //console.log("inited empty file " + fname);
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

//"/latest?user=" + getParamValue("user") 
app.get('/latest', (req,res) => {
    
    let username = req.query.user;
    //console.log(username);
    res.send({ok:true,tweets: usrTweets[username] || [] })
});

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

/// mesaje?user=username
app.get('/mesaje', (req,res) => {
    fs.readFile("index.html", function (err,data) {
        if (err) {
        console.error("Couldn't find index.html");
        return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

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
    let title = req.body.title;
    let emoji = req.body.emoji;
    let ok = auth(user,pass);
    let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");
    if ( ok === false ){
        res.json({ok:false})
        return;
    }
    let id = pushTweetforUser(user,{
        user:user,
        date:date,
        text:text,
        title:title,
        emoji:emoji
    })
    res.json({ok:ok,
        user:user,
        date:date,
        text:text,
        title:title,
        emoji:emoji,
        id:id
    });
    logMessage(`User '${user}' posted a tweet. ( id = ${id} )`);
})

app.put('/editTweet', (req,res) => {
    console.log(req.body);
    let user = req.body.user;
    let pass = req.body.pass;
    let text = req.body.text;
    let emoji = req.body.emoji;
    let id = req.body.id;
    let ok = auth(user,pass);
    let date = dateFormat(new Date(), "mmmm dS, h:MM:ss TT");
    if ( ok === false ){
        res.json({ok:false})
        return;
    }
    res.json({ok:ok, user:user, date:date, emoji:emoji, text:text});
    //editTweet(id, text);
    editTweetforUser(user,id,text,emoji);
    logMessage(`User '${user}' edited a tweet. ( id = ${id} )`);
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
    deleteTweetforUser(user,id);
    logMessage(`User '${user}' deleted a tweet. ( id = ${id} )`);
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

app.listen(port, () => {
    console.log(`Serving at http://localhost:${port}`)
    logMessage("Served booted.");
})
