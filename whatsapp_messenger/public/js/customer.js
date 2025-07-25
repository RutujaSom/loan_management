frappe.ui.form.on('Customer', {
    refresh(frm) {
        // if (!frm.is_new()) {
        //     frm.add_custom_button('Import Customers', () => {
        //         open_import_dialog(frm);
        //     });
        // }
        if (!frm.doc.__islocal) {
            load_customer_insights(frm);
        }
    }
});

function open_import_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Import Customers',
        fields: [
            {
                label: 'File Type',
                fieldname: 'file_type',
                fieldtype: 'Select',
                options: ['CSV', 'Excel'],
                reqd: 1
            },
            {
                label: 'File',
                fieldname: 'file_url',
                fieldtype: 'Attach',
                reqd: 1
            }
        ],
        primary_action_label: 'Import',
        primary_action(values) {
            frappe.call({
                method: 'whatsapp_messenger.api.customer.import_customers_from_file',
                args: {
                    test_plan: frm.doc.name,
                    file_url: values.file_url,
                    file_type: values.file_type
                },
                callback(r) {
                    if (r.message) {
                        frappe.msgprint(r.message);
                        frm.reload_doc();
                    }
                    d.hide();
                }
            });
        }
    });

    d.show();
}


function load_customer_insights(frm) {
    // Load Customer Loans
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Customer Loan",
            filters: {
                customer: frm.doc.name
            },
            fields: ["name", "loan_id", "amount"]
        },
        callback: function(r) {
            let html = "<h4>Customer Loans</h4>";
            (r.message || []).forEach(loan => {
                html += `
                    <div class="loan-btn btn btn-outline-primary d-block text-left mb-2" 
                         data-loan="${loan.name}" 
                         style="cursor: pointer; width: 100%;"
                         title="Click to view EMIs">
                        ${loan.loan_id} - ₹${loan.amount}
                    </div>`;
            });

            frm.fields_dict.custom_customer_loans.$wrapper.html(html);

            // Show EMIs when clicking a loan
            frm.fields_dict.custom_customer_loans.$wrapper.find('.loan-btn').on('click', function() {
                const loan_id = $(this).data('loan');
                load_loan_emis(frm, frm.doc.name, loan_id);
            });
        }
    });
}


function load_loan_emis(frm, customer, loan) {
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Loan EMI",
            filters: {
                customer: customer,
                loan: loan
            },
            fields: ["name", "emi_no", "emi_date", "emi_amount","emi_day","received_date"],
            order_by: "emi_no asc" 
        },
        callback: function(r) {
            let html = `<h5>Loan EMI List</h5>
            <table class='table table-bordered'>
                <thead>
                    <tr>
                        <th>EMI No</th>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Amount</th>
                        <th>Received Date</th>
                    </tr>
                </thead>
            <tbody>`;
            (r.message || []).forEach(emi => {
                html += `<tr class="emi-row" data-emi="${emi.name}" style="cursor:pointer;" title="Click to view EMI">
                            <td>${emi.emi_no}</td>
                            <td>${emi.emi_date}</td>
                            <td>${emi.emi_day}</td>
                            <td>₹${emi.emi_amount}</td>
                            <td>${emi.received_date || ""}</td>
                         </tr>`;
            });
            html += "</tbody></table>";
            frm.fields_dict.custom_loan_emi_details.$wrapper.html(html);

            frm.fields_dict.custom_loan_emi_details.$wrapper.find('.emi-row').on('click', function() {
                const emi_id = $(this).data('emi');
            });
        }
    });
}



// (function () {
//     const custom_doctypes = [
//         { name: "Customer", label: "Customer" },
//         { name: "Customer Loan", label: "Customer Loan" },
//         { name: "Loan EMI", label: "Loan EMI" }
//     ];

//     function isValidRoute(route) {
//         return (
//             route[0] === "Form" &&
//             ["Customer", "Customer Loan", "Loan EMI"].includes(route[1])
//         );
//     }

//     function insertNavbarWhenReady() {
//         let attempts = 0;
//         const maxAttempts = 15;

//         const interval = setInterval(() => {
//             if (!isValidRoute(frappe.router.current_route)) {
//                 clearInterval(interval);
//                 return;
//             }

//             const pageHead = document.querySelector('.page-head');
//             const container = pageHead?.querySelector('.container') || pageHead;

//             if (container && !document.querySelector('#custom-doctype-navbar')) {
//                 const navbar = document.createElement('div');
//                 navbar.id = 'custom-doctype-navbar';
//                 navbar.style.marginTop = '10px';
//                 navbar.style.marginBottom = '10px';

//                 navbar.innerHTML = `
//                     <div style="display: flex; gap: 10px; flex-wrap: wrap;">
//                         ${custom_doctypes.map(dt =>
//                             `<button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', '${dt.name}')">${dt.label}</button>`
//                         ).join('')}
//                     </div>
//                 `;

//                 container.appendChild(navbar);
//                 clearInterval(interval); // Stop retrying after success
//             }

//             if (++attempts >= maxAttempts) {
//                 clearInterval(interval);
//             }
//         }, 300);
//     }

//     // Run on full load
//     frappe.after_ajax(() => {
//         insertNavbarWhenReady();
//     });

//     // Run on route change (List → Form, etc.)
//     frappe.router.on('change', () => {
//         insertNavbarWhenReady();
//     });

//     // Watch DOM changes as backup
//     const observer = new MutationObserver(() => {
//         insertNavbarWhenReady();
//     });
//     observer.observe(document.body, {
//         childList: true,
//         subtree: true
//     });
// })();








// frappe.ui.form.on('Customer', {
//     refresh: function (frm) {
//         // Avoid duplicate navbar
//         alert('in data ...')
//         if (document.querySelector('#custom-doctype-navbar')) return;

//         const custom_doctypes = [
//             { name: "Customer", label: "Customer" },
//             { name: "Customer Loan", label: "Customer Loan" },
//             { name: "Loan EMI", label: "Loan EMI" }
//         ];

//         const navbar = document.createElement('div');
//         navbar.id = 'custom-doctype-navbar';
//         navbar.style.marginTop = '10px';
//         navbar.style.marginBottom = '10px';

//         navbar.innerHTML = `
//             <div style="display: flex; gap: 10px; flex-wrap: wrap;">
//                 ${custom_doctypes.map(dt =>
//                     `<button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', '${dt.name}')">${dt.label}</button>`
//                 ).join('')}
//             </div>
//         `;

//         // Append inside form layout container
//         const layoutWrapper = frm.fields_dict[Object.keys(frm.fields_dict)[0]].wrapper.closest('.form-layout');

//         if (layoutWrapper) {
//             layoutWrapper.prepend(navbar);
//         }
//     }
// });


// frappe.ui.form.on('Customer', {
//     refresh(frm) {
//         alert('ad')
//         // Avoid duplicate
//         if (document.querySelector('#custom-doctype-navbar')) return;
//         alert('daya  ...' )
//         const navbar = document.createElement('div');
//         navbar.id = 'custom-doctype-navbar';
//         navbar.style.margin = '10px 0';

//         navbar.innerHTML = `
//             <div style="display: flex; gap: 10px;">
//                 <button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', 'Customer')">Customer</button>
//                 <button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', 'Customer Loan')">Customer Loan</button>
//                 <button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', 'Loan EMI')">Loan EMI</button>
//             </div>
//         `;

//         const wrapper = frm.fields_dict[Object.keys(frm.fields_dict)[0]]?.wrapper.closest('.form-layout');
//         if (wrapper) {
//             wrapper.prepend(navbar);
//         }
//     }
// });


frappe.ui.form.on('Customer', {
    refresh(frm) {
        const allowedDoctypes = ['Customer', 'Customer Loan', 'Loan EMI'];
        if (!allowedDoctypes.includes(frm.doctype)) return;

        // Always remove old navbar if present (prevents duplication)
        const existing = document.querySelector('#custom-doctype-navbar');
        if (existing) existing.remove();

        const navbar = document.createElement('div');
        navbar.id = 'custom-doctype-navbar';
        navbar.style.margin = '10px 0';

        navbar.innerHTML = `
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${allowedDoctypes.map(dt =>
                    `<button class="btn btn-sm btn-light border" onclick="frappe.set_route('List', '${dt}')">${dt}</button>`
                ).join('')}
            </div>
        `;

        // Append inside the form layout
        const wrapper = frm.fields_dict[Object.keys(frm.fields_dict)[0]]?.wrapper.closest('.form-layout');
        if (wrapper) {
            wrapper.prepend(navbar);
        }
    }
});
