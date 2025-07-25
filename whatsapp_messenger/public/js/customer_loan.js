// frappe.ui.form.on('Customer Loan', {
//     refresh(frm) {
//         frm.add_custom_button('Import Loan', () => {
//             open_import_dialog(frm);
//         });
//     }
// });

function open_import_dialog(frm) {
    const d = new frappe.ui.Dialog({
        title: 'Import Loan',
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
                method: 'whatsapp_messenger.api.customer_loan.import_customer_loan_from_file',
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




frappe.ui.form.on('Customer Loan', {
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
