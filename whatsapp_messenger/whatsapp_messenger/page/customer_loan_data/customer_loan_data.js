// frappe.pages['customer-loan-data'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Customer Loan Details',
// 		single_column: true
// 	});
// }


frappe.pages['customer-loan-data'].on_page_load = function(wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Customer Loan Dashboard',
        single_column: false
    });

    $(wrapper).html(`
        <div class="row">
            <div class="col-sm-6">
                <h4>Select Customer</h4>
                <div id="customer_selector"></div>
                <div id="customer_details" class="mt-3"></div>
            </div>
            <div class="col-sm-6">
                <h4>Customer Loans</h4>
                <div id="loan_list" class="mb-4"></div>
                <h5 class="mt-4">Loan EMI Details</h5>
                <div id="emi_list"></div>
            </div>
        </div>
    `);

    // Create customer selector
    frappe.ui.form.make_control({
        parent: $('#customer_selector'),
        df: {
            fieldtype: 'Link',
            options: 'Customer',
            label: 'Customer',
            reqd: 1,
            change: function() {
                let customer = this.get_value();
                load_customer(customer);
                load_loans(customer);
                $('#emi_list').empty();
            }
        }
    }).make_input();

    function load_customer(customer) {
        frappe.db.get_doc("Customer", customer).then(doc => {
            $('#customer_details').html(`
                <p><strong>Name:</strong> ${doc.customer_name}</p>
                <p><strong>Email:</strong> ${doc.email_id || ''}</p>
                <p><strong>Mobile:</strong> ${doc.mobile_no || ''}</p>
            `);
        });
    }

    function load_loans(customer) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Customer Loan",
                filters: { customer },
                fields: ["name", "loan_id", "loan_amount"]
            },
            callback: function(r) {
                let html = '';
                (r.message || []).forEach(loan => {
                    html += `<div class="btn btn-sm btn-secondary m-1 loan-btn" data-loan="${loan.name}" title="Click to open loan">${loan.loan_id} - ₹${loan.loan_amount}</div>`;
                });
                $('#loan_list').html(html);

                $('.loan-btn').click(function() {
                    let loan_id = $(this).data('loan');
                    load_emi(customer, loan_id);
                    frappe.set_route("Form", "Customer Loan", loan_id);
                });
            }
        });
    }

    function load_emi(customer, loan) {
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Loan EMI",
                filters: {
                    customer: customer,
                    loan: loan
                },
                fields: ["name", "emi_no", "emi_date", "emi_amount"]
            },
            callback: function(r) {
                let html = '<table class="table table-bordered"><thead><tr><th>#</th><th>Date</th><th>Amount</th></tr></thead><tbody>';
                (r.message || []).forEach(emi => {
                    html += `<tr class="emi-row" data-emi="${emi.name}" style="cursor:pointer;" title="Click to open EMI">
                        <td>${emi.emi_no}</td>
                        <td>${emi.emi_date}</td>
                        <td>₹${emi.emi_amount}</td>
                    </tr>`;
                });
                html += '</tbody></table>';
                $('#emi_list').html(html);

                $('.emi-row').click(function() {
                    const emi_id = $(this).data('emi');
                    frappe.set_route("Form", "Loan EMI", emi_id);
                });
            }
        });
    }
};
