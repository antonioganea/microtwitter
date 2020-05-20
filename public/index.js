// Clientside JS file

async function postData(url = '', data = {}) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
    return response.json();
}

loginform = document.getElementById("loginform");
usernameform = document.getElementById("fname");
passform = document.getElementById("fpass");
tweetcontainer = document.getElementById("tweet-container");
loggedinDisplay = document.getElementById("loggedin");
loggedinparent = document.getElementById("loggedinparent");
loginformDisp = document.getElementById("loginformDisp");


/*
                <div class="tweet">
                    <div class="tweetheader">
                        <div>@antonioganea</div>
                        <div class="date">17 apr</div>
                    </div>
                    <hr>
                    So this is what i was saying regarding that..
                </div>
*/

function showElem(elem, show){
    if ( show === true ){
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}

function createTweet(username,date,text){
    let tweet = document.createElement('div');
    tweet.setAttribute('class', 'tweet');

    let tweetHeader = document.createElement('div');
    tweetHeader.setAttribute('class', 'tweetheader');
    tweet.appendChild(tweetHeader);

    let d1 = document.createElement('div');
    d1.innerHTML = "@" + username;
    tweetHeader.appendChild(d1);

    let d2 = document.createElement('div');
    d2.setAttribute('class', 'date');
    d2.innerHTML = date;
    tweetHeader.appendChild(d2);

    let hr = document.createElement('hr');
    tweet.appendChild(hr);

    tweet.innerHTML += text;

    tweetcontainer.appendChild(tweet);
}

function clearTweets() {
    tweetcontainer.innerHTML = "";
}

function loggedInDisplay(text){
    showElem(loggedinparent,true);
    loggedinDisplay.innerHTML = text;
}

function getLatestTweets() {
    postData("/latest").then(data=>{
        if (data.ok !== true){ return; }
        clearTweets();
        data.tweets.forEach(tweet => {
            createTweet(tweet.user, tweet.date, tweet.text);
        });
    });
}

function checkIfLogged() {
    let user = window.localStorage.getItem("loggedUsername");
    let pass = window.localStorage.getItem("loggedPassword");
    if ( user !== null && pass !== null ) {
        onLogged(user, pass, false);
    }
}
checkIfLogged();

function onLogged(user, pass, storeLogged = true) {
    loggedInDisplay("Logged in as " + user);
    showElem(loginform, false);
    if ( storeLogged ) {
        window.localStorage.setItem("loggedUsername", user);
        window.localStorage.setItem("loggedPassword", pass);
    }
}

function onLoginClick() {
    //createTweet("antonio","17 apr", "hello");
    postData("/login", {user: usernameform.value, pass: passform.value}).then(data=>{
        console.log(data);
        if ( data.ok === true ){
            onLogged(data.user, data.pass);
        } else {
            loginFormDisp("Failed to login!");
        }
    });
}

var loginFormDispTimeout = null;

function loginFormDisp(text){
    loginformDisp.innerHTML = text
    clearTimeout(loginFormDispTimeout);
    loginFormDispTimeout = setTimeout(()=>{
        loginformDisp.innerHTML = ""
    }, 1000);
}

function onRegisterClick() {
    //clearTweets();
    postData("/register", {user: usernameform.value, pass: passform.value}).then(data=>{
        console.log(data);
        if ( data.ok === true ){
            onLogged(data.user, data.pass);
        } else {
            loginFormDisp("Failed to register!");
        }
    });
}

function logout(){
    window.localStorage.removeItem("loggedUsername");
    window.localStorage.removeItem("loggedPassword");
    showElem(loginform,true);
    showElem(loggedinparent,false);
}

function onLogoutClick() {
    logout();
}