copy manifest.json release
copy styles.css release
npx esbuild main_src.js --outfile=release/main.js --minify