frappe.listview_settings['Loan EMI'] = {
    onload: function(listview) {
        listview.page.add_inner_button(__('Show Report'), () => {
            frappe.set_route('/app/custom-loan-emi-view');
        });
    }
};


// frappe.ui.form.on('Loan EMI', {
//     refresh(frm) {
//         frm.add_custom_button('Import Loan', () => {
//             open_import_dialog(frm);
//         });
//     }
// });

function open_import_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Import EMI',
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
                method: 'whatsapp_messenger.api.loan_emi.import_loan_emi_from_file',
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



// frappe.ui.form.on('Loan EMI', {
//     customer(frm) {
//         // Clear the loan field when customer changes
//         frm.set_value('loan', null);
//     },

//     onload: function(frm) {
//         frm.set_query("loan", function() {
//             if (frm.doc.customer) {
//                 return {
//                     filters: {
//                         customer: frm.doc.customer
//                     }
//                 };
//             } else {
//                 // return empty filter if customer not selected
//                 return {
//                     filters: {
//                         name: ["is", "set to null"]
//                     }
//                 };
//             }
//         });
//     }
// });

frappe.ui.form.on('Loan EMI', {
    customer(frm) {
        frm.set_value('loan', null);  // Clear loan on customer change
    },

    onload(frm) {
        frm.set_query("loan", () => {
            // Ensure customer is a string and exists
            const customer = frm.doc.customer;

            // If no customer, return an empty result (safe fallback)
            if (!customer) {
                return {
                    filters: {
                        name: ""
                    }
                };
            }

            return {
                // Optional: add filters (if you're using a custom query or get_list)
                filters: {
                    customer: customer
                },
                
                // Custom get_data to show 'loan_id - ₹amount'
                get_data: async function () {
                    alert('aa ..')
                    const r = await frappe.call({
                        method: "frappe.client.get_list",
                        args: {
                            doctype: "Customer Loan",
                            filters: { customer: customer },
                            fields: ["name", "loan_id", "amount"],
                            limit_page_length: 10
                        }
                    });
                    alert('in data ...')

                    return (r.message || []).map(row => ({
                        value: row.name,  // actual value saved
                        description: `${row.loan_id} - ₹${row.amount}`  // shown in dropdown
                    }));
                }
            };
        });
    }
});


frappe.ui.form.on('Loan EMI', {
    loan(frm) {
        if (frm.doc.loan) {
            frappe.db.get_value('Customer Loan', frm.doc.loan, 'emi_amount')
                .then(r => {
                    if (r.message) {
                        frm.set_value('emi_amount', r.message.emi_amount);
                    }
                });
        } else {
            frm.set_value('emi_amount', null);
        }
    }
});

frappe.ui.form.on('Loan EMI', {
    emi_date(frm) {
        if (frm.doc.emi_date) {
            const weekday = frappe.datetime.str_to_obj(frm.doc.emi_date)
                .toLocaleDateString('en-IN', { weekday: 'long' }); // or 'en-US'
            frm.set_value('emi_day', weekday);
        } else {
            frm.set_value('emi_day', null);
        }
    }
});


// Final validation on Save (important!)
frappe.ui.form.on('Loan EMI', {
    validate(frm) {
        (frm.doc.emi_transaction || []).forEach(row => {
            if (row.payment_mode === 'Online' && !row.utr_no) {
                frappe.throw(`UTR No is required for row with Online payment.`);
            }
        });
    }
});




frappe.ui.form.on('Loan EMI', {
	refresh: function(frm) {
		calculate_total_and_check_completion(frm);
	},

	emi_amount: function(frm) {
		calculate_total_and_check_completion(frm);
	},

	emi_transaction_add: function(frm, cdt, cdn) {
		calculate_total_and_check_completion(frm);
	},

	emi_transaction_remove: function(frm) {
		calculate_total_and_check_completion(frm);
	}
});

// ✅ Trigger when any row's amount is changed
frappe.ui.form.on('EMI Transaction', {
	amount: function(frm, cdt, cdn) {
		calculate_total_and_check_completion(frm);
	}
});

// ✅ Utility function to calculate total and check completion
function calculate_total_and_check_completion(frm) {
	let total = 0;

	(frm.doc.emi_transaction || []).forEach(row => {
		total += flt(row.amount || 0);
	});

	frm.set_value('total', total);
	if (frm.doc.emi_amount && total == frm.doc.emi_amount) {
		frm.set_value('emi_complete', true);
	} else {
		frm.set_value('emi_complete', false);
	}
}





