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

// (function () {
//     function isCustomerListRoute(route) {
//         return (
//             Array.isArray(route) &&
//             route.length >= 2 &&
//             route[0] === 'List' &&
//             route[1] === 'Customer'
//         );
//     }

//     function toggleCustomerUIElements() {
//         const route = frappe.router.current_route;

//         const tryToggle = () => {
//             const sidebar = document.querySelector('.layout-side-section');
//             const btnGroup = document.querySelector('.page-actions .btn-group');

//             if (isCustomerListRoute(route)) {
//                 if (sidebar) sidebar.style.display = 'none';
//                 if (btnGroup) btnGroup.style.display = 'none';
//             } else {
//                 if (sidebar) sidebar.style.display = '';
//                 if (btnGroup) btnGroup.style.display = '';
//             }
//         };

//         // Retry logic for async DOM rendering
//         let attempts = 0;
//         const interval = setInterval(() => {
//             attempts++;
//             tryToggle();
//             // Stop after 5 tries or when sidebar is found
//             if (attempts >= 5 || document.querySelector('.layout-side-section')) {
//                 clearInterval(interval);
//             }
//         }, 300);
//     }

//     // On initial load
//     frappe.after_ajax(() => {
//         toggleCustomerUIElements();
//     });

//     // On route change
//     frappe.router.on('change', () => {
//         toggleCustomerUIElements();
//     });

//     // Observe changes (in case DOM updates after render)
//     const observer = new MutationObserver(() => {
//         toggleCustomerUIElements();
//     });

//     observer.observe(document.body, {
//         childList: true,
//         subtree: true
//     });
// })();




(function () {
    function isCustomerListRoute(route) {
        return (
            Array.isArray(route) &&
            route.length >= 2 &&
            route[0] === 'List' &&
            route[1] === 'Customer'
        );
    }

    function hideCustomerElementsImmediately() {
        // Create a <style> tag and inject CSS rules into the DOM
        const style = document.createElement('style');
        style.id = 'customer-ui-hide-style';
        style.innerHTML = `
            .hide-customer-ui .layout-side-section,
            .hide-customer-ui .page-actions .btn-group {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function toggleCustomerPageClass() {
        const route = frappe.router.current_route;
        const body = document.body;

        if (isCustomerListRoute(route)) {
            body.classList.add('hide-customer-ui');
        } else {
            body.classList.remove('hide-customer-ui');
        }
    }

    // Inject the CSS rules once on load
    hideCustomerElementsImmediately();

    // Run initially after AJAX (page load)
    frappe.after_ajax(() => {
        toggleCustomerPageClass();
    });

    // Also run on every route change
    frappe.router.on('change', () => {
        toggleCustomerPageClass();
    });
})();
