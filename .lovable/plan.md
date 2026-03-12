

## Plan: Add Google Tag Manager to the project

Add the GTM snippets to `index.html`:

1. **Head script** — Insert the GTM `<script>` tag inside `<head>`, right after the `<meta charset>` tag
2. **Body noscript** — Insert the GTM `<noscript>` iframe immediately after the `<body>` opening tag

Both snippets use container ID `GTM-W3SX9XRM`.

### File changed
- `index.html` — two insertions (head script + body noscript)

