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



frappe.listview_settings['Customer'] = {
    onload(listview) {
        alert('in load ...')
        // Hide the sidebar
        $('.layout-side-section').hide();

        // Hide buttons to the left of +Add Customer
        $('.list-row-head .btn-group').hide(); // older versions
        $('.page-actions .btn-group').first().hide(); // newer versions
    }
};

