(function () {
    // Check if current route is "Customer Loan" list view
    function isCustomerLoanListRoute(route) {
        return (
            Array.isArray(route) &&
            route.length >= 2 &&
            route[0] === 'List' &&
            route[1] === 'Customer Loan'
        );
    }

    // Inject style to hide elements when class is active
    function injectStyleOnce() {
        if (document.getElementById('customer-loan-style')) return;

        const style = document.createElement('style');
        style.id = 'customer-loan-style';
        style.innerHTML = `
            body.hide-customer-loan-ui .layout-side-section,
            body.hide-customer-loan-ui .page-actions .btn-group {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Toggle class on body based on route
    function toggleCustomerLoanUI() {
        const body = document.body;
        if (isCustomerLoanListRoute(frappe.router.current_route)) {
            body.classList.add('hide-customer-loan-ui');
        } else {
            body.classList.remove('hide-customer-loan-ui');
        }
    }

    // Inject CSS rules immediately
    injectStyleOnce();

    // Run initially after full page load
    frappe.after_ajax(() => {
        toggleCustomerLoanUI();
    });

    // Also respond to route changes
    frappe.router.on('change', () => {
        toggleCustomerLoanUI();
    });

    // Watch for DOM mutations in case elements load later
    const observer = new MutationObserver(() => {
        toggleCustomerLoanUI();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
