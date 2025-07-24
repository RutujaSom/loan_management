// frappe.listview_settings['Customer'] = {
//     onload(listview) {
//         // Remove now
//         removeElements();

//         // Watch DOM changes
//         const observer = new MutationObserver(() => {
//             if (frappe.router.current_route[1] === 'customer') {
//                 removeElements();
//             }
//         });

//         observer.observe(document.body, {
//             childList: true,
//             subtree: true
//         });

//         // Listen to route changes (Frappe SPA navigation)
//         frappe.router.on('change', () => {
//             if (frappe.router.current_route[1] === 'customer') {
//                 // Delay needed to allow layout render
//                 setTimeout(removeElements, 100);
//             }
//         });

//         function removeElements() {
//             const sidebar = document.querySelector('.layout-side-section');
//             const btnGroup = document.querySelector('.page-actions .btn-group');

//             if (sidebar) sidebar.remove();
//             if (btnGroup) btnGroup.remove();
//         }
//     }
// };

(function () {
    function isCustomerListRoute(route) {
        return route[0] === 'List' && route[1] === 'Customer' && (route[2] === 'List' || !route[2]);
    }

    function removeCustomerUIElements() {
        if (!isCustomerListRoute(frappe.router.current_route)) return;

        const sidebar = document.querySelector('.layout-side-section');
        const btnGroup = document.querySelector('.page-actions .btn-group');

        if (sidebar) sidebar.remove();
        if (btnGroup) btnGroup.remove();
    }

    // ✅ Run after full page load (covers full refresh)
    frappe.after_ajax(() => {
        setTimeout(removeCustomerUIElements, 300);
    });

    // ✅ React to route changes (SPA navigation)
    frappe.router.on('change', () => {
        setTimeout(removeCustomerUIElements, 300);
    });

    // ✅ Watch for DOM changes in case layout is lazy-rendered
    const observer = new MutationObserver(() => {
        removeCustomerUIElements();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
