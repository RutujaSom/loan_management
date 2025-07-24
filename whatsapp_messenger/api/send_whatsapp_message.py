import requests
import frappe

@frappe.whitelist()
def send_whatsapp_installment_reminder(
    access_token: str,
    phone_number_id: str,
    recipient_number: str,
    name: str,
    installment_date: str,
    amount: str,
    closing_note: str,
    template_name: str = "monthly_installment",
    language_code: str = "mr"
) -> dict:
    """
    Sends a WhatsApp message using Facebook's Graph API.

    Args:
        access_token (str): WhatsApp Business API access token
        phone_number_id (str): WhatsApp Business phone number ID
        recipient_number (str): Recipient's phone number with country code
        name (str): Customer name
        installment_date (str): Installment due date
        amount (str): Payment amount
        closing_note (str): Closing message
        template_name (str): WhatsApp template name (default: "monthly_installment")
        language_code (str): Language code (default: "mr" for Marathi)

    Returns:
        dict: API response from WhatsApp
    """
    
    url = f"https://graph.facebook.com/v19.0/{phone_number_id}/messages"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    print('headers ....',headers)

    payload = {
        "messaging_product": "whatsapp",
        "to": recipient_number,
        "type": "template",
        "template": {
            "name": template_name,
            "language": {
                "code": language_code
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": name},
                        {"type": "text", "text": installment_date},
                        {"type": "text", "text": amount},
                        {"type": "text", "text": closing_note}
                    ]
                }
            ]
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()  # Raises exception for 4XX/5XX errors
        return response.json()
    
    except requests.exceptions.RequestException as e:
        return {
            "error": str(e),
            "status_code": getattr(e.response, 'status_code', None)
        }


# Configuration (should ideally come from environment variables/secure storage)
CONFIG = {
    "ACCESS_TOKEN": "EAAbZCIzLtH5IBPFopXXJnr9ilTxhnXMDQH06ZBYnRnMFw6EcyX4QEFcPvzhB9soxUtPffyowLvZAMIy4biSzPwCVFUZCzUSJcfv7mS69ShMgCrVeMw2PwurKf7U5IYOMqYOU9XYNgFqwhg33B86Cp6xrWkDGtEBRjbLpPXmOEZBu2sZBRVleUKL0NWj4ZAXxhffznaXsHLLG2TiG2hPoERbDhdBeflTfWrjkWxZCIl8OjJktZBetVWe7iYyXzuQZDZD",
    "PHONE_NUMBER_ID": "664207073449818",
    "RECIPIENT_NUMBER": "919595318789"  # With country code

    
}

@frappe.whitelist()
def send_whatsapp_messages(mobile_no,customer,emi_amount, emi_date):
    RECIPIENT_NUMBER = mobile_no
    print('in func ....')

    # Message parameters
    response = send_whatsapp_installment_reminder(
        access_token=CONFIG["ACCESS_TOKEN"],
        phone_number_id=CONFIG["PHONE_NUMBER_ID"],
        recipient_number=RECIPIENT_NUMBER,
        name=customer,
        installment_date=emi_date,
        amount=emi_amount,
        closing_note="धन्यवाद!"
    )

    print("API Response:", response)