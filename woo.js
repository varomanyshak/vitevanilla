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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btnLookupWooInfo').addEventListener('click', getWooOrderData);
    async function getWooOrderData() {
        const selectedPortal = document.getElementById('wooStores').value;
        const wooId = document.getElementById('wooOrderNumber').value;
        if (!areAllNotEmpty(selectedPortal, wooId)) {
            showError('Please ensure you have Selected a Portal and input a Woo Id');
        } else {
            showLoadingOverlay();
            let wooApiResults = await getWooData(selectedPortal, wooId);
            let wooData = parseOutWooData(wooApiResults);
            let propApiResults = await getPropagoData(selectedPortal, wooId);
            let propData = parseOutPropData(propApiResults);
            let mergedData = mergeObjects(wooData, propData);
            $(document).ready(function () {
                let wooTable = $('#dtWoo').DataTable({
                    data: [mergedData],
                    columns: [
                        {
                            data: 'prop_0_orderDate',
                            title: 'Order Date',
                            defaultContent: 'null',
                            render: function (data, type, row) {
                                if (data === null) {
                                    return null;
                                } else {
                                    var date = new Date(data);
                                    var formattedDate = ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "-" + date.getFullYear() + " " + ("0" + (date.getHours() % 12 || 12)).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + " " + (date.getHours() >= 12 ? 'PM' : 'AM');
                                    return formattedDate;
                                }
                            }
                        },
                        {data: 'prop_0_orderNumber', title: 'Order Number', defaultContent: 'null',},
                        {data: 'prop_0_status', title: 'Status', defaultContent: 'null',},
                        {data: 'woo_0_id', title: 'Order ID'},
                        {
                            data: 'woo_0_orderDate',
                            title: 'Order Date',
                            render: function (data) {
                                var date = new Date(data);
                                var formattedDate = ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) + "-" + date.getFullYear() + " " + ("0" + (date.getHours() % 12 || 12)).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + " " + (date.getHours() >= 12 ? 'PM' : 'AM');
                                return formattedDate;
                            }
                        },
                        {data: 'woo_0_sku', title: 'SKU'},
                        {data: 'woo_0_status', title: 'Status'},
                        {
                            data: null,
                            title: 'Repush Order',
                            defaultContent: '<button class="btn btn-secondary btnRepush">Repush Order</button>'
                        }
                    ],
                    searching: false,
                    lengthChange: false,
                    paging: false,
                    info: false
                });
                var headerRow = $('<tr>').insertBefore('#dataTable thead tr:first');
                $('<th>').attr('colspan', 3).text('Propago Data').css('text-align', 'center').css('border', '1px solid black').appendTo(headerRow);
                $('<th>').attr('colspan', 4).text('Woo Data').css('text-align', 'center').css('border', '1px solid black').appendTo(headerRow);
                hideLoadingOverlay();

                $('#dtWoo').on('click', '.btnRepush', function () {
                    //var rowData = wooTable.row($(this).closest('tr')).data();
                    //let propagoOrderNumber = rowData.prop_0_orderNumber;

                    //let propagoOrderNumber = data.;
                    //let orderField2 = data.orderField2;
                    //jsonPayload = data.receivedXml;

                    // if (orderField2 !== '') {
                    //     table.column(2).data().each(function (value, index) {
                    //         if (value !== '') {
                    //             propagoOrderNumber = value;
                    //         }
                    //     });
                    // }
                    //
                    // resubmitModal = new Modal($("#mdlConfirmResend"));
                    // resubmitModal.show();
                    //
                });
            });
        }
    }
    async function getPropagoData(selectedPortal, wooId) {
        const apiEndpoint = `https://api.mypropago.com/v2/orders/search?Status=All&Custom01=${wooId}&Skip=0&Take=1`;
        const clientKey = 'Drummond';
        const clientSecret = 'XRX39DEK';
        const authHeader = 'Basic ' + btoa(`${clientKey}:${clientSecret}`);
        const headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa(clientKey + ':' + clientSecret));

        return fetch(`https://api.mypropago.com/v2/orders/search?Status=All&Custom01=${wooId}&Skip=0&Take=1`, {
            method: 'GET',
            headers: headers
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                    hideLoadingOverlay();
                }
            })
            .catch(error => {
                showError('Error: ' + error.message);
                hideLoadingOverlay();
            });
    }
    async function getWooData(selectedPortal, wooId) {
        return fetch(`https://api-drummond.com/integrationsDashboard/WooCommerceOrderLookup?portal=${selectedPortal}&wooId=${wooId}`, {
            method: 'GET'
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                    hideLoadingOverlay();
                }
            })
            .catch(error => {
                showError('Error: ' + error.message);
                hideLoadingOverlay();
            });
    }
});
function parseOutWooData(wooData) {
    let data = JSON.parse(wooData);
    let parsedOrders = [];
    if (data !== null) {
        let id = data[0].id;
        let status = data[0].status;
        let date_created = data[0].orderDate;
        let sku = data[0].sku;

        parsedOrders.push({
            'id': id,
            'status': status,
            'orderDate': date_created,
            'sku': sku
        });
    }
    return parsedOrders;
}
function parseOutPropData(data) {
    let parsedOrders;
    if (data !== null && data.results.length > 0) {
        const orderNumber = data.results[0].orderDisplayNumber;
        const status = data.results[0].status;
        const orderDate = data.results[0].orderDate;

        parsedOrders = [{
            orderNumber: orderNumber,
            status: status,
            orderDate: orderDate
        }];
    } else {
        parsedOrders = [{
            orderNumber: null,
            status: null,
            orderDate: null
        }];
    }
    return parsedOrders;
}
function mergeObjects(wooData, propData) {
    const mergedData = {};

    function mergeRecursive(target, source, prefix) {
        for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
                mergeRecursive(target, source[key], `${prefix}_${key}`);
            } else {
                const finalKey = isNaN(parseInt(key)) ? `${prefix}_${key}` : `${prefix}`;
                target[finalKey] = source[key];
            }
        }
    }

    mergeRecursive(mergedData, wooData, 'woo');
    mergeRecursive(mergedData, propData, 'prop');

    return mergedData;
}
function showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'block';
}
function hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
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
