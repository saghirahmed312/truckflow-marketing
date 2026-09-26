#!/bin/sh
# Stamp a new ?v= cache-busting version on the CSS/JS links in every page.
# GitHub Pages lets browsers cache files for 10 minutes; without a new
# version, a visitor can get new HTML paired with a stale stylesheet/script.
# Run this after editing css/styles.css or js/main.js, before committing.
cd "$(dirname "$0")/.." || exit 1
v=$(date +%Y%m%d%H%M%S)
for f in *.html; do
  sed -i.bak -E \
    -e "s#(/css/styles\.css)(\?v=[0-9]+)?\"#\1?v=$v\"#g" \
    -e "s#(/js/main\.js)(\?v=[0-9]+)?\"#\1?v=$v\"#g" "$f" && rm -f "$f.bak"
done
echo "Asset version set to $v"
