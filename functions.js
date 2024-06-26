import Swal from 'sweetalert2'
import $ from 'jquery'

const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
const showSignUpButton = document.getElementById('showSignUp');
const showSignInButton = document.getElementById('showSignIn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');
let accesses = [];

export const showSignUp = () => {
    authContainer.classList.add('right-panel-active');
}

export function showSignIn () {
    authContainer.classList.remove('right-panel-active');
}

export function trySignUp (event){
    event.preventDefault();
    const username = document.getElementById('signUpForm').elements['username'].value;
    const password = document.getElementById('signUpForm').elements['password'].value;

    $.ajax({
        type: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        url: apiBaseUrl + '/User/addUser',
        data: JSON.stringify({username, password }),
        success: function (data) {
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
            let token = data.token
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
                url: apiBaseUrl + '/User/getUsersAssignedPages',
                data: { username: username },
                success: function (dataR) {
                    appContainer.classList.add('logged-in')
                    accesses = dataR
                    let mItems = '';
                    mItems += `<div class="navbar">`
                    mItems += generateMenu(accesses);
                    mItems += '<button onClick="logout()" style="position: absolute; right: 10px">Logout</button></div>'
                    // document.getElementById('loginedUsername').innerHTML = data.username
                    document.body.innerHTML = mItems + `<iframe style="width: 100vw; height: calc(100vh - 46px); margin-top: 46px" id="myIframe" src="/welcome.html"></iframe>`
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
    document.body.innerHTML = `<div id="app">
      <div id="navmenu">
      </div>
      <div class="auth-container" id="auth-container">
        <div class="form-container sign-up-container">
          <form id="signUpForm" action="#" method="post">
            <h1>Create Account</h1>
            <input name="username" type="text" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button onclick="trySignUp(event)">Sign Up</button>
          </form>
        </div>
        <div class="form-container sign-in-container">
          <form id="signInForm" action="/" method="post">
            <h1>Sign in</h1>
            <input name="username" type="text" placeholder="Username" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit" id="signin_btn" onclick="trySignIn(event)">Sign In</button>
          </form>
        </div>
        <div class="overlay-container">
          <div class="overlay">
            <div class="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button class="ghost" onclick="document.getElementById('auth-container').classList.remove('right-panel-active');">Sign In</button>
            </div>
            <div class="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button class="ghost" onClick="document.getElementById('auth-container').classList.add('right-panel-active')">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
      <div class="main-container">
      </div>
    </div>`
}
export function loadHTML(url){
    document.querySelector("iframe").src = `/${url.substring(1)}`;
}
const generateMenu = (items) => {
    let menuHTML = '';
    if(items.length > 0) {
        items.map(item => {
          if (item.parentId === null) {
              const children = items.filter(child => child.parentId === item.pageId);
              if (children.length > 0) {
                  menuHTML += `<div class="dropdown"> <button class="dropbtn">${item.pageName}</button><div class="dropdown-content">`
                  children.map(child => {
                      menuHTML += `<button onClick='changeIframeSrc("${child.internalUrl}")'>${child.pageName}</button>`;
                      const subchilds = items.filter(sitem => sitem.parentId === child.pageId);
                      if(subchilds.length > 0) {
                        menuHTML += '<div class="dropdown-s"> <button class="dropbtn">'+
                        item.pageName + '<svg style="float: right;transform: rotate(270deg)" aria-hidden="true" focusable="false" role="img" class="octicon octicon-triangle-down" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display:inline-block;user-select:none;vertical-align:text-bottom;overflow:visible"><path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path></svg>' +
                        '</button><div class="dropdown-content-s">'
                        subchilds.map(subchild => {
                          menuHTML += `<button onClick='changeIframeSrc("${subchild.internalUrl}")'>${subchild.pageName}</button>`;
                        });
                        menuHTML += '</div></div>';
                      }
                    });
                    menuHTML += '</div></div>';
            } else {
                menuHTML += `<button onClick='changeIframeSrc("${item.internalUrl}")'>${item.pageName}</button>`;
            }
          }
        });
    }
    return menuHTML;
  }

  // Function to change the src attribute of the iframe
export function changeIframeSrc(newSrc) {
  // Check if the target HTML URL is valid and accessible
  fetch((window.location.href + newSrc.substring(2)).toString())
    .then(response => {
      if (response.ok) {
        // If the URL is valid and accessible, change the src attribute of the iframe
        document.getElementById("myIframe").src = newSrc;
      } else {
        // If the URL is not valid or accessible, handle the situation (e.g., display an error message)
        alert("The target HTML URL is not accessible.");
      }
    })
    .catch(error => {
      alert("An error occurred while checking the target HTML URL:", error);
    });
}

