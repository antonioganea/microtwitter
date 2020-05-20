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

usernameform = document.getElementById("fname");
passform = document.getElementById("fpass");
tweetcontainer = document.getElementById("tweet-container");

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

function onLoginClick() {
    createTweet("antonio","17 apr", "hello");
    postData("/login", {user: usernameform.value, pass: passform.value}).then(data=>{
        console.log(data);
    });
}

function onRegisterClick() {
    clearTweets();
    postData("/register", {user: usernameform.value, pass: passform.value}).then(data=>{
        console.log(data);
    });
}