(function () {
    // Check if route is Loan EMI List View
    function isLoanEmiListRoute(route) {
        return (
            Array.isArray(route) &&
            route.length >= 2 &&
            route[0] === 'List' &&
            route[1] === 'Loan EMI'
        );
    }

    // Inject CSS dynamically (only once)
    function injectLoanEmiStyle() {
        if (document.getElementById('loan-emi-style')) return;

        const style = document.createElement('style');
        style.id = 'loan-emi-style';
        style.innerHTML = `
            body.hide-loan-emi-ui .layout-side-section,
            body.hide-loan-emi-ui .page-actions .btn-group {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Add or remove class on body
    function toggleLoanEmiUI() {
        const body = document.body;
        if (isLoanEmiListRoute(frappe.router.current_route)) {
            body.classList.add('hide-loan-emi-ui');
        } else {
            body.classList.remove('hide-loan-emi-ui');
        }
    }

    // Inject style on load
    injectLoanEmiStyle();

    // On first load
    frappe.after_ajax(() => {
        toggleLoanEmiUI();
    });

    // On route changes
    frappe.router.on('change', () => {
        toggleLoanEmiUI();
    });

    // Watch for DOM mutations (for safety)
    const observer = new MutationObserver(() => {
        toggleLoanEmiUI();
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
