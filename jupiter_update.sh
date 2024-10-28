#!/bin/bash
cd public
rm main-3.1.0-app.js main-3.1.0-Jupiter.css main-3.1.0-Tailwind.css main-v3.js scoped-preflight.css
curl -O -L https://terminal.jup.ag/main-3.1.0-app.js
curl -O -L https://terminal.jup.ag/main-3.1.0-Jupiter.css
curl -O -L https://terminal.jup.ag/main-3.1.0-Tailwind.css
curl -O -L https://terminal.jup.ag/main-v3.js
touch scoped-preflight.css
cd ..
python3 jupiter_strip_css.py