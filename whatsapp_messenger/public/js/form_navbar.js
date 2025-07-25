console.log('✅ form_navbar.js loaded');

frappe.ui.form.on('*', {
    refresh: function (frm) {
        console.log('Refreshing form for:', frm.doctype);
        alert('Form loaded: ' + frm.doctype);
    }
});
