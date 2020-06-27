// Clientside JS file

function getPageName(){
    let url = window.location.pathname;
    return url.split("?")[0];
}

function getParamValue(_pname){
    var urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has(_pname)){
        return null;
    }
    return urlParams.get(_pname);
}

/*
function getParamValue(_pname) {
    let url = window.location.pathname;
    var params = url.split("?")[1].split("&");
    params.forEach(param => {
        let split = param.split("=");
        let pname = split[0];
        let pvalue = split[1];
        if ( pname === _pname ){
            return pvalue
        }
    });
    return null;
}
*/

function isWallPage(){
    //console.log(getParamValue("user"))
    if ( getPageName() === "/mesaje" ){
        if ( getParamValue("user") ) {
            return true;
        }
    }
    return false;
}

async function reqData(method, url = '', data = {}) {
    const response = await fetch(url, {
        method: method,
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

async function postData(url,data){
    return reqData('POST',url,data);
}

async function deleteData(url,data){
    return reqData('DELETE',url,data);
}

async function updateData(url,data){
    return reqData('PUT',url,data);
}

async function getData(url){
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
        'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        //body: JSON.stringify(data)
    });
    return response.json();
}

getData("/smoketest",{hello:"hello"}).then((data)=>{
    console.log(data);
});

loginform = document.getElementById("loginform");
usernameform = document.getElementById("fname");
passform = document.getElementById("fpass");
tweetcontainer = document.getElementById("tweet-container");
loggedinDisplay = document.getElementById("loggedin");
loggedinparent = document.getElementById("loggedinparent");
loginformDisp = document.getElementById("loginformDisp");

globalUser = null;
globalPass = null;


function checkIfLogged() {
    let user = window.localStorage.getItem("loggedUsername");
    let pass = window.localStorage.getItem("loggedPassword");
    if ( user !== null && pass !== null ) {
        if ( isWallPage() === false ) {
            window.location = "/mesaje?user=" + user;
        }
        onLogged(user, pass, false);
    }
}
checkIfLogged();


/*
                <div class="tweet">
                    <div class="tweetheader">
                        <div>@antonioganea</div>
                        <div class="date">17 apr</div>
                    </div>
                    <hr>
                    <article>So this is what i was saying regarding that..</article>
                    <br>
                    <div class="tweet-button-container">
                        <input type="submit" value="Edit" onclick="return onEditClick(this,32);" style="margin-right: 5px;">
                        <input type="submit" value="Delete" onclick="return onDeleteClick(this,32);">
                    </div>
                </div>
*/

function showElem(elem, show){
    if ( show === true ){
        elem.style.display = "block";
    } else {
        elem.style.display = "none";
    }
}

function createTweet(username,date,text, emoji, id = -1){
    emoji = emoji || '';

    let tweet = document.createElement('div');
    tweet.setAttribute('class', 'tweet');
    tweet.setAttribute('id','tweet-' + id);
    //tweet.innerHTML += `<emoji>${emoji}</span>`;

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

    let emojiDisplay = document.createElement('emoji');
    emojiDisplay.innerHTML = emoji;
    tweet.appendChild(emojiDisplay);

    let hr = document.createElement('hr');
    tweet.appendChild(hr);

    let article = document.createElement('article');
    tweet.appendChild(article);
    article.innerHTML = text;

    if ( getUser() === username ){
        tweetAttachButtons(tweet,id);
    }

    return tweet;
}

function tweetAttachButtons(tweet, id){
    let br = document.createElement('br');
    tweet.appendChild(br);

    let div = document.createElement('div');
    div.setAttribute('class','tweet-button-container');
    tweet.appendChild(div);

    div.innerHTML =  '<input type="submit" value="Edit" onclick="return onEditClick(this,' + id + ');" style="margin-right: 5px;">\
    <input type="submit" value="Delete" onclick="return onDeleteClick(this,' + id + ');"></input>';
}

function getWriterEmoji(){
    let radios = document.getElementsByName('w_reaction');
    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return 'x';
}

function getEditorEmoji(){
    let radios = document.getElementsByName('e_reaction');
    for (let i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return 'x';
}

function createTweetOnBottom(user,date,text, emoji, id) {
    let tw = createTweet(user,date,text, emoji, id);
    tweetcontainer.appendChild(tw);
}

//createTweetOnBottom('antonio','right now','this is purely generated',10);

function createTweetOnTop(user,date,text, emoji, id) {
    let tw = createTweet(user,date,text, emoji, id);
    tweetcontainer.prepend(tw);
}

function clearTweets() {
    tweetcontainer.innerHTML = "";
}

function loggedInDisplay(text){
    showElem(loggedinparent,true);
    loggedinDisplay.innerHTML = text;
}

function getLatestTweets() {
    if ( isWallPage() ) {
        getData("/latest?user=" + getParamValue("user") ).then(data=>{
            if (data.ok !== true){ return; }
            clearTweets();
            data.tweets.forEach(tweet => {
                createTweetOnBottom(tweet.user, tweet.date, tweet.text, tweet.emoji, tweet.id);
            });
        });
    }
}

getLatestTweets()

function onLogged(user, pass, storeLogged = true) {
    loggedInDisplay("Logged in as @" + user);
    showElem(loginform, false);
    globalUser = user;
    globalPass = pass;
    if ( storeLogged ) {
        window.localStorage.setItem("loggedUsername", user);
        window.localStorage.setItem("loggedPassword", pass);
    }
    backToWriting();
    getLatestTweets();
}

function onLoginClick() {
    //createTweet("antonio","17 apr", "hello");
    postData("/login", {user: usernameform.value, pass: passform.value}).then(data=>{
        console.log(data);
        if ( data.ok === true ){
            onLogged(data.user, data.pass);
            window.location = "/mesaje?user=" + data.user;
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
            window.location = "/mesaje?user=" + data.user;
        } else {
            loginFormDisp("Failed to register!");
        }
    });
}

function hideWritingPanels(){
    showElem(tweetEditorPanel,false);
    showElem(tweetWriterPanel,false);
}

function logout(){
    window.localStorage.removeItem("loggedUsername");
    window.localStorage.removeItem("loggedPassword");
    showElem(loginform,true);
    showElem(loggedinparent,false);
    globalPass = null;
    globalUser = null;
    hideWritingPanels();
    getLatestTweets();
}

function onLogoutClick() {
    logout();
}

tweetEditor = document.getElementById("tweetEditor");

function isLogged() {
    if ( getUser() && getPass() ){
        return true;
    } else {
        return false;
    }
}

function getUser(){
    return globalUser;
}

function getPass() {
    return globalPass;
}

function postTweet(text, emoji) {
    let user = getUser();
    let pass = getPass();
    let data = {text:text, emoji:emoji, user:user, pass:pass};

    postData("/postTweet", data).then(data=>{
        console.log(data);
        if ( data.ok === true ){
            //onLogged(data.user, data.pass);
            createTweetOnTop(data.user,data.date,data.text,data.emoji,data.id);
        } else {
            alert("Post failed!");
        }
    });
}

function onPostClick() {
    let text = tweetEditor.value;
    let emoji = getWriterEmoji();
    if ( text !== "" )
        postTweet(text, emoji);
    tweetEditor.value="";
}

tweetWriterPanel = document.getElementById("tweetWriterPanel");
tweetEditorPanel = document.getElementById("tweetEditorPanel");
tweetEditor2 = document.getElementById("tweetEditor2");

var G_editTweet = null;
var G_editTweetID = null;

function editTweet(text,tweet,id){
    G_editTweet = tweet;
    G_editTweetID = id;
    showElem(tweetWriterPanel,false);
    showElem(tweetEditorPanel,true);
    tweetEditor2.value = text;
}

function backToWriting(){
    showElem(tweetWriterPanel,true);
    showElem(tweetEditorPanel,false);
}

function getTweetText(tweet) {
    return tweet.getElementsByTagName('article')[0].innerText;
}

function onEditClick(elem, id){
    let tweet = elem.parentNode.parentNode;
    let text = getTweetText(tweet);
    editTweet(text,tweet,id);
    console.log("tweet id " + id)
}

function deleteTweet(elem,id){
    elem.parentNode.removeChild(elem);
}

function onDeleteClick(elem, id){
    let tweet = elem.parentNode.parentNode;
    deleteTweet(tweet,id);

    let user = getUser();
    let pass = getPass();
    let data = { user:user, pass:pass, id:id};
    deleteData("/deleteTweet",data);
}

function setTweetText(tweet, text){
    tweet.getElementsByTagName('article')[0].innerHTML = text;
}

function setTweetEmoji(tweet, emoji){
    tweet.getElementsByTagName('emoji')[0].innerHTML = emoji;
}

function onEditTweetCommitClick(){
    let newtext = tweetEditor2.value;
    let emoji = getEditorEmoji();
    setTweetText(G_editTweet, newtext);
    setTweetEmoji(G_editTweet, emoji);
    backToWriting();

    let user = getUser();
    let pass = getPass();
    let data = {text:newtext, emoji:emoji, user:user, pass:pass, id:G_editTweetID};
    updateData("/editTweet",data);
}