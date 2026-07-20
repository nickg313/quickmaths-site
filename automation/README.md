# Parent lead automation (n8n)

The lead form on `parents.html` collects **first name + last name + email** and POSTs
them as JSON (`{ "firstName": "...", "lastName": "...", "email": "..." }`) to an n8n
webhook. This folder holds the matching n8n workflow, which does two things with each
lead: sends the welcome email from nick@quickmath.io with the free Skool community
link, and appends a row (timestamp, first name, last name, email) to a Google Sheet
so every lead is tracked.

Until the webhook URL is configured, the form shows the confirmation screen but the
lead is NOT stored or emailed anywhere. Wiring this up is required for the funnel to work.

## Setup (about 10 minutes)

1. In n8n: **Workflows → Import from File** → pick `n8n-parent-lead-workflow.json`.
2. Open the **Send email from Nick** node and attach a **Microsoft Outlook** credential
   for nick@quickmath.io (n8n walks you through the Microsoft sign-in the first time;
   this is the right node for a business Microsoft 365 / Outlook mailbox).
   If the import ever misbehaves, the workflow is trivial to rebuild by hand:
   a **Webhook** node (POST, path `parent-lead`, respond immediately) connected to a
   **Microsoft Outlook → Send a message** node using the fields/expressions from the
   JSON file. (Fallback if OAuth is blocked by your tenant: the generic **Send Email**
   SMTP node with Microsoft 365 SMTP AUTH, host smtp.office365.com, port 587.)
3. Create a Google Sheet for the lead log (e.g. "A* Machine Leads") with this exact
   header row in row 1: **Timestamp | First name | Last name | Email**. Then open the
   **Log lead to Google Sheets** node, attach a Google credential (sign in with the
   Google account that owns the sheet), and pick the spreadsheet and sheet from the
   two dropdowns. The column mapping is pre-filled to match those headers.
4. **Activate** the workflow (toggle top-right), then copy the webhook's
   **Production URL** from the Webhook node.
5. In `parents.html`, find `const N8N_WEBHOOK_URL = "N8N_WEBHOOK_URL"` and replace the
   placeholder with the Production URL. Commit and deploy.
6. Test: submit the live form with your own name and email. You should get the email
   within seconds, a new row should appear in the sheet, and the n8n execution log
   should show a successful run.

## Notes

- The email copy lives in the **Send email from Nick** node. Edit it freely in n8n;
  no site deploy needed.
- The email and the sheet append run as separate branches, with the email first and
  the Sheets node set to continue on error, so a Sheets problem can never stop a
  parent getting their welcome email.
- Worth adding next: a delayed follow-up email a few days later for people who never
  join the community.
- CORS: n8n webhooks accept cross-origin browser POSTs by default (Allowed Origins `*`).
  If you ever lock that down, allow `https://www.astarmachine.co.uk`.
- This folder contains no secrets (no API keys, no credentials), so it is safe in the
  repo. It does get deployed with the static site like every other file; if you would
  rather not have it publicly fetchable, move the folder out of the repo or exclude it
  with a `.vercelignore` entry.
