/*
import $ from "jquery";
import Swal from "sweetalert2";

document.addEventListener("DOMContentLoaded", () => {
    const apiBaseUrl = 'https://aspnetclusters-175530-0.cloudclusters.net'
    getDataForGrid(apiBaseUrl);
});

async function getDataForGrid(apiBaseUrl) {

    const response = await fetch(apiBaseUrl + `/getPendingUsers`)
    console.log(respoonse);
/!*    if (!response.ok) {
        showError('Failed to fetch data');
    }*!/

    const data = await response.json();
console.log(data);
    let table = $('#dtApproveUsers').DataTable({
        data: data,
        columns: [
            {data: 'user_id', title: 'Id'},
            {data: 'user_name', title: 'User Name'},
            {data: 'apiErrorMessage', title: 'Error Messsage'},
            {
                data: null,
                title: 'Approve User',
                defaultContent: '<button class="action-btn">Approve User</button>'
            }
        ]
    });
}

const showError = (message) => {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'OK'
    });
};
*/
