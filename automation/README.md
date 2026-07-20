# Parent lead automation (n8n)

The lead form on `parents.html` collects **first name + email** and POSTs them as JSON
(`{ "firstName": "...", "email": "..." }`) to an n8n webhook. This folder holds the
matching n8n workflow: webhook in, welcome email out (sent from nick@quickmath.io with
the free Skool community link).

Until the webhook URL is configured, the form shows the confirmation screen but the
lead is NOT stored or emailed anywhere. Wiring this up is required for the funnel to work.

## Setup (about 10 minutes)

1. In n8n: **Workflows → Import from File** → pick `n8n-parent-lead-workflow.json`.
2. Open the **Send email from Nick** node and attach your Gmail credential for
   nick@quickmath.io (n8n walks you through the Google sign-in the first time).
   If the import ever misbehaves, the workflow is trivial to rebuild by hand:
   a **Webhook** node (POST, path `parent-lead`, respond immediately) connected to a
   **Gmail → Send Message** node using the fields/expressions from the JSON file.
3. **Activate** the workflow (toggle top-right), then copy the webhook's
   **Production URL** from the Webhook node.
4. In `parents.html`, find `const N8N_WEBHOOK_URL = "N8N_WEBHOOK_URL"` and replace the
   placeholder with the Production URL. Commit and deploy.
5. Test: submit the live form with your own name and email. You should get the email
   within seconds, and the n8n execution log should show a successful run.

## Notes

- The email copy lives in the **Send email from Nick** node. Edit it freely in n8n;
  no site deploy needed.
- Worth adding next: a **Google Sheets → Append Row** node after the webhook so every
  lead is logged somewhere you can see (name, email, timestamp), and a delayed
  follow-up email a few days later for people who never join the community.
- CORS: n8n webhooks accept cross-origin browser POSTs by default (Allowed Origins `*`).
  If you ever lock that down, allow `https://www.astarmachine.co.uk`.
- This folder contains no secrets (no API keys, no credentials), so it is safe in the
  repo. It does get deployed with the static site like every other file; if you would
  rather not have it publicly fetchable, move the folder out of the repo or exclude it
  with a `.vercelignore` entry.
