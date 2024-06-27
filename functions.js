import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import $ from 'jquery'
import Swal from 'sweetalert2'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import jsZip from 'jszip';
import DataTable from 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5';
import 'datatables.net-buttons-dt/css/buttons.dataTables.min.css'
import { Modal } from "bootstrap";
DataTable.Buttons.jszip(jsZip);

const dbApiBaseUrl = 'https://api-drummond.com/';
const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
const showSignUpButton = document.getElementById('showSignUp');
const showSignInButton = document.getElementById('showSignIn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app');
let accesses = [];
var modal;
let resubmitModal;
let prettyData;
let orderFieldTwo;
let jsonPayload;

$(document).ready(function() {
    modal = new Modal($("#mdlTAG"));
    modal.hide();
    resubmitModal = new Modal($("#mdlConfirmResend"));
    resubmitModal.hide();
});

$(document.body).on("click", "#mdlTAG #tagModalDialog #tagModalContent #tagModalFooter #btnDownloadJson", function(){
    downloadJson();
});
function hide_modal_popup(){
    $("body").removeClass("modal-open");
    $(".modal-backdrop").fadeOut();
    $(".modal").fadeOut();
    $("body").removeAttr("style");
}

$(document.body).on("click", "#mdlTAG #tagModalDialog #tagModalContent #tagModalFooter #btnCloseModal", function(){
    hide_modal_popup();
});

$(document.body).on("click", "#btnResubmit", function () {
    repushTAGPayload();
});

$(document.body).on("click", "#btnClose", function(){
    hide_modal_popup();
});

$(document.body).on("click", "#tagDiv #btnGetTagData", function(){
    event.preventDefault();
    getTagData();
});
async function repushTAGPayload() {
    showLoadingOverlay();
    btnClose.innerText = 'Close';
    const url = dbApiBaseUrl + 'tag/warehouse-order';
    const data = JSON.parse(jsonPayload);
    prettyData = JSON.stringify(data, null, 2);
    let options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: prettyData
    };

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            const responseData = data;
            document.getElementById('inputAPIResult').value = 'Api Response: ' + data;
        })
        .catch(error => {
            showError('Error:', error);
        });
    hideLoadingOverlay();
}
function areAllNotEmpty(...variables) {
    return variables.every(variable => variable !== '');
}
const showError = (message) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK'
    });
};
function showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'block';
}
function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
}
async function downloadJson() {
    var blob = new Blob([prettyData], {type: 'application/json'});
    var a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = orderFieldTwo + '.json';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
async function getTagData() {
    let po = document.getElementById('poNumber').value;

    if (!areAllNotEmpty(po)) {
        showError('Please input a TAG PO Number.');
    } else {
        showLoadingOverlay();
        try {
            const response = await fetch(dbApiBaseUrl + `integrationsDashboard/TAGOrderLookup?ponumber=${po}`)
            if (!response.ok) {
                showError('Failed to fetch data');
            }
            const data = await response.json();
            let receivedPayloads = data.length;

            let postSuccess = data.reduce(function (count, obj) {
                if (obj["propagoOrderNumber"] && obj["propagoOrderNumber"].trim() !== "") {
                    count++;
                }
                return count;
            }, 0);

            let postFailures = receivedPayloads - postSuccess;

            let totalsData = [
                {"Metric": "Total Received Payloads", "Value": receivedPayloads},
                {"Metric": "Count of Successful Posts", "Value": postSuccess},
                {"Metric": "Count of Failed Posts", "Value": postFailures}
            ];
            $('#dtTAGTotals').DataTable({
                data: totalsData,
                columns: [
                    {data: 'Metric'},
                    {data: 'Value'}
                ],
                searching: false,
                paging: false,
                info: false
            });

            data.forEach(row => {
                row.expandCollapseButton = '';
            });
            let table = $('#dtTAG').DataTable({
                layout: {
                    topEnd: {
                        search: {return: true},
                        buttons: [{
                            extend: 'excelHtml5',
                        }]
                    }
                },
                data: data,
                columns: [
                    {data: 'expandCollapseButton', title: '', className: 'details-control', orderable: false},
                    {data: 'id', title: 'id'},
                    {data: 'propagoOrderNumber', title: 'Order Number'},
                    {
                        data: 'receivedDateTime',
                        title: 'Received',
                        render: function (data) {
                            var date = new Date(data);
                            var formattedDate = ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "-" + date.getFullYear() + " " + ("0" + (date.getHours() % 12 || 12)).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + " " + (date.getHours() >= 12 ? 'PM' : 'AM');
                            return formattedDate;
                        }
                    },
                    {data: 'orderField2', title: 'Order Field 2'},
                    {data: 'tagpoNumber', title: 'TAG PO Number'},
                    {data: 'apiErrorMessage', title: 'Error Messsage'},
                    {
                        data: null,
                        title: 'Resubmit Payload',
                        defaultContent: '<button class="action-btn">Resend Payload</button>'
                    }
                ],
                initComplete: function () {
                    $('div.dt-layout-cell.dt-end').addClass('dt-tag-export-button')
                }
            });
            $('#dtTAG').on('click', '.action-btn', function () {
                var data = table.row($(this).parents('tr')).data();
                let propagoOrderNumber = '';
                let orderField2 = data.orderField2;
                jsonPayload = data.receivedXml;
                if (orderField2 !== '') {
                    table.column(2).data().each(function (value, index) {
                        if (value !== '') {
                            propagoOrderNumber = value;
                        }
                    });
                }

                //if (propagoOrderNumber !== '') {
                //    showError('Please review.  This Order Field 2 already exists in Propago -- ' + propagoOrderNumber);
                //} else {
                resubmitModal = new Modal($("#mdlConfirmResend"));
                resubmitModal.show();
                //}

                //console.log('Button pressed for row with data:', data.orderField2);
            });
            $("#dtTAG").on('click', '.details-control', function () {
                const row = table.row(this);
                const rowData = table.row(this).data();
                $('#mdlTAG .modal-body').empty();

                if (typeof rowData === 'object') {
                    orderFieldTwo = rowData.orderField2;
                    const data = JSON.parse(rowData.receivedXml);
                    prettyData = JSON.stringify(data, null, 2);
                    $('#mdlTAG .modal-body').append('<pre>' + prettyData + '</pre>');
                } else {
                    $('#mdlTAG .modal-body').text(rowData);
                }
                modal = new Modal($("#mdlTAG"));
                modal.show();
            });

            hideLoadingOverlay();
            return data;
        } catch (error) {
            hideLoadingOverlay();
            console.error('Error fetching data:', error);
        }
    }
}
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
                text: "You are registered and pending approval!",
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
function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
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
                    setCookie("signcheck","checked",7);
                    accesses = dataR
                    let mItems = '';
                    mItems += `<div class="navbar">`
                    mItems += generateMenu(accesses);
                    mItems += '<button onClick="logout()" style="position: absolute; right: 10px">Logout</button></div>'
                    // document.getElementById('loginedUsername').innerHTML = data.username
                    document.body.innerHTML = mItems + `<iframe style="width: 100vw; height: calc(100vh - 46px); margin-top: 64px" id="myIframe" src="/welcome.html"></iframe>`
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
                      // menuHTML += `<button onClick='changeIframeSrc("${child.internalUrl}")'>${child.pageName}</button>`;
                      const subchilds = items.filter(sitem => sitem.parentId === child.pageId);
                      if(subchilds.length > 0) {
                        menuHTML += '<div class="dropdown-s"> <button class="dropbtn">'+
                        child.pageName + '<svg style="float: right;transform: rotate(270deg)" aria-hidden="true" focusable="false" role="img" class="octicon octicon-triangle-down" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style="display:inline-block;user-select:none;vertical-align:text-bottom;overflow:visible"><path d="m4.427 7.427 3.396 3.396a.25.25 0 0 0 .354 0l3.396-3.396A.25.25 0 0 0 11.396 7H4.604a.25.25 0 0 0-.177.427Z"></path></svg>' +
                        '</button><div class="dropdown-content-s">'
                        subchilds.map(subchild => {
                          menuHTML += `<button onClick='changeIframeSrc("${subchild.internalUrl}")'>${subchild.pageName}</button>`;
                        });
                        menuHTML += '</div></div>';
                      } else {
                        menuHTML += `<button onClick='changeIframeSrc("${child.internalUrl}")'>${child.pageName}</button>`;
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
//   fetch((window.location.href + newSrc.substring(2)).toString())
//     .then(response => {
//       if (response.ok) {
//         document.getElementById("myIframe").src = newSrc;
//       } else {
//         alert("The target HTML URL is not accessible.");
//       }
//     })
//     .catch(error => {
//       alert("An error occurred while checking the target HTML URL:", error);
//         document.getElementById("myIframe").src = newSrc;
//     });
    document.getElementById("myIframe").src = newSrc;
}