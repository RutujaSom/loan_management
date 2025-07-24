

// frappe.pages['custom-loan-emi-view'].on_page_load = function(wrapper) {
// 	const page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Customer Loan EMI View',
// 		single_column: true
// 	});

// 	// UI layout (customer selection removed)
// 	$(wrapper).find('.layout-main-section').html(`
// 		<div class="d-flex justify-content-between align-items-end flex-wrap mb-3">
// 			<div class="d-flex align-items-end gap-3 flex-wrap">
// 				<div style="width: 150px;margin-right: 20px;">
// 					<label>Days Ahead</label>
// 					<select class="form-control" id="days_input"></select>
// 				</div>
// 				<div>
// 					<button class="btn btn-primary mt-3" id="search_button">Search</button>
// 				</div>
// 			</div>
// 			<div>
// 				<button class="btn btn-success mt-3" id="send_message_btn" style="display: none;">Send WhatsApp Message</button>
// 			</div>
// 		</div>
// 		<div id="emi_results" style="flex: 1 1 auto;"></div>
// 	`);

// 	// Populate "Days Ahead"
// 	const daysSelect = document.getElementById("days_input");
// 	for (let i = 1; i <= 30; i++) {
// 		const option = document.createElement("option");
// 		option.value = i;
// 		option.text = i;
// 		daysSelect.appendChild(option);
// 	}

// 	// 🔍 Search button action
// 	$('#search_button').on('click', function () {
// 		const days_ahead = $('#days_input').val();

// 		frappe.call({
// 			method: 'whatsapp_messenger.api.loan_emi.fetch_filtered_emis',
// 			args: { days_ahead },
// 			callback: function (r) {
// 				const emis = r.message || [];
// 				const $results = $('#emi_results');
// 				$results.empty();

// 				if (emis.length === 0) {
// 					$results.html('<p>No EMI records found.</p>');
// 					$('#send_message_btn').hide();
// 					return;
// 				}

// 				$('#send_message_btn').show();

// 				let table_html = `
// 					<table class="table table-bordered">
// 						<thead>
// 							<tr>
// 								<th><input type="checkbox" id="select_all"/></th>
// 								<th>#</th>
// 								<th>Loan ID</th>
// 								<th>Customer</th>
// 								<th>Mobile No</th>
// 								<th>EMI No</th>
// 								<th>EMI Date</th>
// 								<th>Amount</th>
// 							</tr>
// 						</thead>
// 						<tbody>
// 				`;

// 				emis.forEach((emi, index) => {
// 					table_html += `
// 						<tr>
// 							<td><input type="checkbox" class="row-check" 
// 								data-mobile="${emi.mobile_no}" 
// 								data-title="${emi.title}" 
// 								data-emi_amount="${emi.emi_amount}" 
// 								data-emi_date="${emi.emi_date}" />
// 							</td>
// 							<td>${index + 1}</td>
// 							<td>${emi.loan_id}</td>
// 							<td>${emi.title}</td>
// 							<td>${emi.mobile_no}</td>
// 							<td>${emi.emi_no}</td>
// 							<td>${frappe.datetime.str_to_user(emi.emi_date)}</td>
// 							<td>₹${emi.emi_amount}</td>
// 						</tr>
// 					`;
// 				});

// 				table_html += `</tbody></table>`;
// 				$results.html(table_html);

// 				// Select all checkboxes
// 				$('#select_all').on('change', function () {
// 					$('.row-check').prop('checked', this.checked);
// 				});

// 				// Send message logic
// 				$('#send_message_btn').off('click').on('click', function () {
// 					const selected = $('.row-check:checked');
// 					if (selected.length === 0) {
// 						frappe.msgprint("Please select at least one record.");
// 						return;
// 					}

// 					frappe.confirm(`Send WhatsApp message to ${selected.length} customer(s)?`, () => {
// 						selected.each(function () {
// 							const mobile = $(this).data('mobile');
// 							const title = $(this).data('title');
// 							const emi_amount = $(this).data('emi_amount');
// 							const emi_date = $(this).data('emi_date');

// 							frappe.call({
// 								method: 'whatsapp_messenger.api.send_whatsapp_message.send_whatsapp_messages',
// 								args: {
// 									mobile_no: mobile,
// 									customer:title,
// 									emi_amount:emi_amount,
// 									emi_date:emi_date,
// 								}
// 							});
// 						});

// 						frappe.msgprint("Messages have been sent.");
// 					});
// 				});
// 			}
// 		});
// 	});
// };



frappe.pages['custom-loan-emi-view'].on_page_load = function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Customer Loan EMI View',
		single_column: true
	});

	$(wrapper).find('.layout-main-section').html(`
		<div class="d-flex justify-content-between align-items-end flex-wrap mb-3">
			<div class="d-flex align-items-end gap-3 flex-wrap">
				<div style="width: 150px; margin-right: 20px;">
					<label>Days Ahead</label>
					<select class="form-control" id="days_input"></select>
				</div>
				<div>
					<button class="btn btn-primary mt-3" id="search_button">Search</button>
				</div>
			</div>
			<div class="d-flex gap-2 flex-wrap">
				<button class="btn btn-success mt-3" id="send_message_btn" style="display: none; margin-right: 20px;">Send WhatsApp Message</button>
				<button class="btn btn-secondary mt-3" id="export_btn" style="display: none;">Export to Excel</button>
			</div>
		</div>
		<div id="emi_results" style="flex: 1 1 auto;"></div>
	`);

	const daysSelect = document.getElementById("days_input");
	for (let i = 1; i <= 30; i++) {
		const option = document.createElement("option");
		option.value = i;
		option.text = i;
		daysSelect.appendChild(option);
	}

	let current_emi_data = [];

	$('#search_button').on('click', function () {
		const days_ahead = $('#days_input').val();

		frappe.call({
			method: 'whatsapp_messenger.api.loan_emi.fetch_filtered_emis',
			args: { days_ahead },
			callback: function (r) {
				const emis = r.message || [];
				current_emi_data = emis;
				const $results = $('#emi_results');
				$results.empty();

				if (emis.length === 0) {
					$results.html('<p>No EMI records found.</p>');
					$('#send_message_btn').hide();
					$('#export_btn').hide();
					return;
				}

				$('#send_message_btn').show();
				$('#export_btn').show();

				let table_html = `
					<table class="table table-bordered">
						<thead>
							<tr>
								<th><input type="checkbox" id="select_all"/></th>
								<th>#</th>
								<th>Loan ID</th>
								<th>Customer</th>
								<th>Mobile No</th>
								<th>EMI No</th>
								<th>EMI Date</th>
								<th>Amount</th>
							</tr>
						</thead>
						<tbody>
				`;

				emis.forEach((emi, index) => {
					table_html += `
						<tr>
							<td><input type="checkbox" class="row-check" 
								data-mobile="${emi.mobile_no}" 
								data-title="${emi.title}" 
								data-emi_amount="${emi.emi_amount}" 
								data-emi_date="${emi.emi_date}" />
							</td>
							<td>${index + 1}</td>
							<td>${emi.loan_id}</td>
							<td>${emi.title}</td>
							<td>${emi.mobile_no}</td>
							<td>${emi.emi_no}</td>
							<td>${frappe.datetime.str_to_user(emi.emi_date)}</td>
							<td>₹${emi.emi_amount}</td>
						</tr>
					`;
				});

				table_html += `</tbody></table>`;
				$results.html(table_html);

				$('#select_all').on('change', function () {
					$('.row-check').prop('checked', this.checked);
				});
			}
		});
	});

	// Inject XLSX if not loaded
	if (typeof XLSX === "undefined") {
		const script = document.createElement('script');
		script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
		script.onload = () => console.log("XLSX loaded");
		document.head.appendChild(script);
	}

	// 📤 Export to Excel
	$('#export_btn').on('click', function () {
		if (!current_emi_data.length) return;

		const data = current_emi_data.map((emi, index) => ({
			"Sr. No": index + 1,
			"Loan ID": emi.loan_id,
			"Customer": emi.title,
			"Mobile No": emi.mobile_no,
			"EMI No": emi.emi_no,
			"EMI Date": frappe.datetime.str_to_user(emi.emi_date),
			"Amount": emi.emi_amount
		}));

		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "EMI Report");
		XLSX.writeFile(workbook, "loan_emi_report.xlsx");
	});

	// 📩 Send WhatsApp messages
	$('#send_message_btn').off('click').on('click', function () {
		const selected = $('.row-check:checked');
		if (selected.length === 0) {
			frappe.msgprint("Please select at least one record.");
			return;
		}

		frappe.confirm(`Send WhatsApp message to ${selected.length} customer(s)?`, () => {
			selected.each(function () {
				const mobile = $(this).data('mobile');
				const title = $(this).data('title');
				const emi_amount = $(this).data('emi_amount');
				const emi_date = $(this).data('emi_date');

				frappe.call({
					method: 'whatsapp_messenger.api.send_whatsapp_message.send_whatsapp_messages',
					args: {
						mobile_no: mobile,
						customer: title,
						emi_amount: emi_amount,
						emi_date: emi_date,
					}
				});
			});

			frappe.msgprint("Messages have been sent.");
		});
	});
};
