const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBdXRoZW50aWNhdGlvbiIsImp0aSI6IjdiN2FjOGEwLTcxZTAtNDM1YS1iYjJhLTQyODc0N2YwOGUzNyIsImlhdCI6MTcxODY1Mjg0NCwiaWQiOiI0IiwibmJmIjoxNzE4NjUyODQ0LCJleHAiOjE3MTg2NTY0NDQsImlzcyI6IkF1dGgiLCJhdWQiOiJBdXRoVXNlcnMifQ.Nt98QbyyFF0kaqFSKazCjVceuGfwqzCpTZj74BijvN0'
const showSignUpButton = document.getElementById('showSignUp');
const showSignInButton = document.getElementById('showSignIn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');
let accesses = [];

export const showSignUp = () => {
    authContainer.classList.add("right-panel-active");
}

export function showSignIn () {
    authContainer.classList.remove("right-panel-active");
}

export function trySignUp (event){
    event.preventDefault();
    const username = document.getElementById('signUpForm').elements['username'].value;
    const password = document.getElementById('signUpForm').elements['password'].value;

    $.ajax({
        type: "POST",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": token
        },
        url: apiBaseUrl + '/User/addUser',
        data: { username, password },
        success: function (data) {
            console.log('data', data)
        }
    });
}

export function trySignIn (event){
    event.preventDefault();
    const username = document.getElementById('signInForm').elements['username'].value;
    const password = document.getElementById('signInForm').elements['password'].value;

    $.ajax({
        type: "GET",
        headers: {
            'Content-Type': 'application/json',
            "Authorization": token
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', token);
        },
        url: apiBaseUrl + '/User/getUserWithPages',
        data: { username },
        success: function (data) {
            appContainer.classList.add('logged-in')
            accesses = data.accesses
            let mItems = '';
            accesses.map(access=>{
                mItems += `<li><a>${access.pageName}</a></li>`
            })
            document.getElementById('menu-ul').innerHTML = mItems
        }
    });
    return
    $.ajax({
        type: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        url: apiBaseUrl + '/User/login',
        data: { username, password },
        success: function (data) {
            console.log('data', data)
        }
    });
}

export function logout () {
    appContainer.classList.remove('logged-in')
}
