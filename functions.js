const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
let token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBdXRoZW50aWNhdGlvbiIsImp0aSI6IjExYjM2YmNiLTkxZDYtNDIzMC05ZTVjLTVjOTZiN2UwNzFmMyIsImlhdCI6MTcxODczNDYxMCwiaWQiOiI0IiwibmJmIjoxNzE4NzM0NjEwLCJleHAiOjE3MTg3MzgyMTAsImlzcyI6IkF1dGgiLCJhdWQiOiJBdXRoVXNlcnMifQ.efqPuq_Oli-wJOpqyyWDTX9SM2FjqOrn5V_pCbbOBlY'
const showSignUpButton = document.getElementById('showSignUp');
const showSignInButton = document.getElementById('showSignIn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');
let accesses = [];
import Swal from 'sweetalert2'

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
        data: { username: username,
             password: password },
        success: function (data) {
            console.log('data', data)
            Swal.fire({
                title: "Success",
                text: "A new user has been registered successfully!",
                icon: "success"
            });
        },
        error: function (xhr, status) {
            Swal.fire({
                title: "Error",
                text: "Internal server error!",
                icon: "error"
            });
            console.log('xhr', xhr)
        }
    });
}

export function trySignIn (event){
    event.preventDefault();
    const username = document.getElementById('signInForm').elements['username'].value;
    const password = document.getElementById('signInForm').elements['password'].value;

    
    $.ajax({
        type: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({ username, password }),
        url: apiBaseUrl + '/User/login',
        success: function (data) {
            token = data.token
            token  = "Bearer " + token
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
                data: { username: username },
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
        },
        error: function (xhr, status) {
            Swal.fire({
                title: "Warning",
                text: "Login credential mismatch or internal server error!",
                icon: "warning"
            });
            console.log('xhr', xhr)
        }
    });
}

export function logout () {
    appContainer.classList.remove('logged-in')
}
