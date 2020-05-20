
const express = require('express')
const app = express()
const port = 80

const fs = require('fs');
const dateFormat = require('dateformat');

var bodyParser = require('body-parser');

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
    let date = dateFormat(new Date(), "dddd, mmmm dS, yyyy, h:MM:ss TT");
    res.json({ok:ok, user:user, date:date, text:text});
})

app.post('/register', (req,res) => {
    console.log(req.body);
    res.json({ok:true, user:req.body.user, pass:req.body.pass});
})

app.use('/static', express.static('public'))

app.listen(port, () => console.log(`Serving at http://localhost:${port}`))
