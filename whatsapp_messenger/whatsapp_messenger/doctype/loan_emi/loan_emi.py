# Copyright (c) 2025, Excellminds and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

import frappe
from frappe import _
from datetime import datetime, timedelta

class LoanEMI(Document):
	
	def validate(self):
		print('in validation ...............')
		if self.loan and self.emi_no:
			exists = frappe.db.exists(
				"Loan EMI",
				{
					"loan": self.loan,
					"emi_no": self.emi_no,
					"name": ["!=", self.name],  # exclude current doc for updates
				}
			)
			if exists:
				frappe.throw(_("An EMI with this Loan and EMI No already exists."))


