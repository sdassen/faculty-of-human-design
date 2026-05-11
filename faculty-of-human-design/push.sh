#!/bin/bash
cd ~/Desktop/faculty-of-human-design
git add api/checkout.js src/App.jsx
git commit -m "Add dynamic Stripe Checkout for all reports

- Replace static payment links with /api/checkout.js serverless function
- Creates Stripe Checkout Session per rapport (card + iDEAL)
- Maandelijks rapport gebruikt subscription mode
- Success/cancel URL automatisch ingesteld naar site
- goToStripe is nu async, roept /api/checkout aan"
git push
echo "✅ Gepusht"
