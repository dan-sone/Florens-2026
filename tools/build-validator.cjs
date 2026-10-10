require('esbuild').buildSync({entryPoints:['tools/validator-entry.js'],bundle:true,minify:true,format:'iife',globalName:'PlacesValidator',outfile:'places-validator.js',legalComments:'eof'});
