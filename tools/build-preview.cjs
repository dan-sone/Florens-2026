// Build an online-only preview from shared application code and separate content.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=path.resolve(root,process.argv[2]||'examples/stockholm');
const target=path.resolve(root,process.argv[3]||'demo');
const shared=path.relative(target,root).split(path.sep).join('/')+'/';
fs.mkdirSync(target,{recursive:true});
let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
// Offline packages belong to their destination; online previews do not load them.
html=html.replace(/<script\b[^>]*src="(?:offline-(?:files|storage|map|app)\.js)[^"]*"[^>]*><\/script>/g,'');
html=html.replace(/(<(?:script|link)\b[^>]*\b(?:src|href)=")([^"#]+)(")/g,(all,a,url,b)=>/^(?:https?:|\/)/.test(url)?all:a+shared+url+b);
fs.writeFileSync(path.join(target,'index.html'),html);
for(const name of ['places','routes','guide','stories','history','taxonomy','app-config']){
 const file=name+'.json',data=JSON.parse(fs.readFileSync(path.join(source,file),'utf8'));
 fs.copyFileSync(path.join(source,file),path.join(target,file));
 fs.copyFileSync(path.join(root,data.$schema),path.join(target,data.$schema));
}
console.log('Built online preview:',path.relative(root,target));
