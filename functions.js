const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBdXRoZW50aWNhdGlvbiIsImp0aSI6ImQzYjFmYjM1LTM0NzQtNDYwMi1hZmU0LTEzMjA5ZWViZjcwNyIsImlhdCI6MTcxODYzOTQ3MiwiaWQiOiI0IiwibmJmIjoxNzE4NjM5NDcyLCJleHAiOjE3MTg2NDMwNzIsImlzcyI6IkF1dGgiLCJhdWQiOiJBdXRoVXNlcnMifQ.BPB5dsOnN0nMAUDQ78Kn-I4G5GA-r4FxgoyO0P0JvWU'
const showSignUpButton = document.getElementById('showSignUp');
const showSignInButton = document.getElementById('showSignIn');
const authContainer = document.getElementById('auth-container');

export function showSignUp () {
    console.log('show sign up')
    event.preventDefault();
    authContainer.classList.add("right-panel-active");
}

export function showSignIn () {
    event.preventDefault();
    console.log('aaa')
    authContainer.classList.remove("right-panel-active");
}

export function trySignUp (){
    event.preventDefault();
    const username = document.getElementById('signUpForm').elements['username'].value;
    const password = document.getElementById('signUpForm').elements['password'].value;

    $.ajax({
        type: "POST",
        url: apiBaseUrl + '/User/addUser',
        data: { username, password },
        success: function (data) {
            console.log('data', data)
        }
    });
}

export function trySignIn (){
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
            console.log('data', data)
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
