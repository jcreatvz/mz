> Current website flow: Email score opens a composer for manual submissions. This optional direct-sending handler is dormant and not required.

# Direct score email — prepared, not connected

The live MZ site is static and has no email credentials configured. `result-email.mjs` is a prepared server-side handler, not an active service. The website currently uses the restored email-composer flow. PNG, CSV and copy still work. 

To activate:

1. Supply a transactional email sender (the handler uses Resend) and an authorized sender address. Keep `RESEND_API_KEY`, `MZ_RESULTS_FROM`, and `MZ_RESULTS_TO` as private server environment variables. Set `MZ_RESULTS_TO` to the desired private recipient.
2. Deploy this handler behind a server endpoint, with `MZ_SITE_ORIGIN` equal to the exact website origin. For this release it is `https://metro-zoomin-zoom-run.jc-lutao.chatgpt.site`. A different GitHub-hosted domain needs its own matching origin.
3. For a future direct-sending flow, replace the current email-composer listener with the server submission listener and configure its endpoint; sync and publish. The reserved `submission.endpoint` setting is not used by the current manual flow.
4. Verify a real submission after setup. The UI clears the results panel only after `{sent:true}`. That response means the email provider accepted the message, not that it was read or delivered to the inbox. Failures retain all results.

The recipient and sender cannot be supplied by browser requests. The handler validates the result, caps payload size, checks origin and reuses the run ID as the provider’s idempotency key. Its per-instance throttle is a basic casual safeguard, not a distributed rate limiter or score verification service. Add a durable limiter/challenge before broad public promotion. The handler is excluded from the static `dist` directory. No provider credentials are stored in this repository.
