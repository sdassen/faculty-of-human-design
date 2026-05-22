#!/bin/bash
# Run this script to commit and push the HTML/Chromium PDF migration
cd "$(dirname "$0")"

git add lib/pdf/index.js lib/pdf/template.js lib/pdf/render.js lib/pdf/bodygraph-svg.cjs package.json

git commit -m "feat: replace PDFKit renderer with HTML/Chromium pipeline

- bodygraph-svg.cjs: pure SVG bodygraph (360x500 viewBox, 5-pass render)
- render.js: Chromium PDF renderer via @sparticuz/chromium on Vercel
- template.js: full HTML template (cover, TOC, profile, bodygraph, sections)
- index.js: thin entry point, same generatePDF signature, Inngest unchanged
- package.json: add @sparticuz/chromium + puppeteer-core, remove pdfkit

Eliminates blank-page bugs by delegating pagination to the browser CSS engine.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push

echo ""
echo "=== DEPLOYED ==="
echo ""
echo "Test the new PDF renderer:"
echo "  https://www.facultyhd.com/api/create-order?testPdf=0920314c-cb4f-49aa-905f-ff1086e29d01&secret=fhd-test-2026"
echo ""
echo "If the test order has English section titles, regenerate via Inngest:"
echo '  { "name": "order/paid", "data": { "orderId": "0920314c-cb4f-49aa-905f-ff1086e29d01" } }'
