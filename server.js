const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, 'data', 'db.json');
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Curated starter catalogue keeps the app useful even if the public metadata API is offline.
const starter = [
  [5114,'Fullmetal Alchemist: Brotherhood',['Action','Adventure','Drama','Fantasy'],'Two brothers search for the Philosopher’s Stone after a failed alchemical ritual.'],
  [16498,'Attack on Titan',['Action','Drama','Fantasy','Mystery'],'Humanity fights for survival behind enormous walls as the truth about the Titans unfolds.'],
  [1535,'Death Note',['Mystery','Supernatural','Thriller'],'A student discovers a notebook that can kill anyone whose name is written in it.'],
  [20,'Naruto',['Action','Adventure','Comedy'],'A young ninja works toward recognition and dreams of becoming his village’s leader.'],
  [21,'One Piece',['Action','Adventure','Comedy','Fantasy'],'Monkey D. Luffy and his crew sail toward the legendary treasure known as One Piece.'],
  [40748,'Jujutsu Kaisen',['Action','Fantasy','Supernatural'],'A high-schooler joins a secret world of sorcerers and dangerous curses.'],
  [38000,'Demon Slayer: Kimetsu no Yaiba',['Action','Fantasy','Supernatural'],'Tanjiro becomes a demon slayer while searching for a way to save his sister.'],
  [11061,'Hunter x Hunter (2011)',['Action','Adventure','Fantasy'],'Gon sets out to become a Hunter and find the father he has never known.'],
  [30276,'One Punch Man',['Action','Comedy','Sci-Fi'],'A hero who can defeat any opponent with one punch searches for a worthy challenge.'],
  [9253,'Steins;Gate',['Drama','Sci-Fi','Thriller'],'A group of friends discover a way to send messages into the past.'],
  [31964,'My Hero Academia',['Action','Comedy','School'],'In a world of superpowers, Izuku works to become the hero he has always admired.'],
  [44511,'Chainsaw Man',['Action','Fantasy','Horror'],'A young devil hunter is transformed and pulled into a brutal supernatural world.'],
  [50265,'Spy x Family',['Action','Comedy','Slice of Life'],'A spy, an assassin and a telepath form an unusual family under secret identities.'],
  [9989,'Anohana: The Flower We Saw That Day',['Drama','Supernatural'],'Old friends reunite after a childhood tragedy changes their lives.'],
  [40456,'Demon Slayer: Kimetsu no Yaiba – The Movie: Mugen Train',['Action','Fantasy'],'The Demon Slayer Corps investigate a train where passengers are disappearing.'],
  [22319,'Tokyo Ghoul',['Action','Drama','Horror','Supernatural'],'A college student is drawn into the hidden world of flesh-eating ghouls.'],
  [49596,'Blue Lock',['Sports','Drama'],'Strikers compete in an intense program designed to create Japan’s ultimate forward.'],
  [37521,'Vinland Saga',['Action','Adventure','Drama'],'A young warrior seeks purpose amid the violence of the Viking age.'],
  [52991,'Frieren: Beyond Journey’s End',['Adventure','Drama','Fantasy'],'An elven mage reflects on time, friendship and the meaning of a journey after the hero’s quest.'],
  [46569,'Hell’s Paradise: Jigokuraku',['Action','Adventure','Fantasy'],'A condemned shinobi is sent to a mysterious island in search of an elixir.']
].map(([mal_id,title,genreNames,synopsis])=>({mal_id,title,title_english:title,genres:genreNames.map(name=>({name})),synopsis,score:0,episodes:null,type:'TV',status:'Catalogue pick',posterUrl:({5114:'https://animeupdates.party/images/posters/fma.jpg',16498:'https://animeupdates.party/images/posters/aot.jpg',1535:'https://animeupdates.party/images/posters/deathnote.jpg',52991:'https://animeupdates.party/images/posters/frieren.jpg',40748:'https://animeupdates.party/images/posters/jujutsu.jpg',38000:'https://animeupdates.party/images/posters/demonslayer.jpg'}[mal_id]||''),images:{jpg:{image_url:'',large_image_url:''}},url:`https://myanimelist.net/anime/${mal_id}`}));

function readDB(){try{return JSON.parse(fs.readFileSync(DB,'utf8'));}catch{return {watchlist:[],reviews:[],preferences:{genres:['Action','Adventure','Fantasy']}};}}
function writeDB(data){fs.mkdirSync(path.dirname(DB),{recursive:true});fs.writeFileSync(DB,JSON.stringify(data,null,2));}
const cache=new Map();
async function jikan(url){const hit=cache.get(url);if(hit&&Date.now()-hit.time<15*60*1000)return hit.data;const response=await fetch(url,{headers:{'User-Agent':'AniVerseStudentPrototype/2.0'}});if(!response.ok)throw new Error(`Anime metadata service returned ${response.status}`);const body=await response.json();cache.set(url,{time:Date.now(),data:body});return body;}
app.get('/api/health',(_,res)=>res.json({ok:true,app:'AniVerse',catalogue:starter.length}));
app.get('/api/anime/top',async(req,res)=>{try{const page=Math.max(1,Number(req.query.page)||1);const body=await jikan(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=24&filter=bypopularity`);res.json({data:body.data,source:'Jikan'});}catch{res.json({data:starter,source:'Built-in starter catalogue',notice:'Live catalogue is temporarily unavailable. Showing the built-in catalogue.'});}});
app.get('/api/anime/search',async(req,res)=>{const q=String(req.query.q||'').trim();if(!q)return res.json({data:starter,source:'Built-in starter catalogue'});const local=starter.filter(a=>a.title.toLowerCase().includes(q.toLowerCase())||a.genres.some(g=>g.name.toLowerCase().includes(q.toLowerCase())));try{const body=await jikan(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=24&sfw=true`);const merged=[...body.data,...local.filter(x=>!body.data.some(y=>y.mal_id===x.mal_id))];return res.json({data:merged,source:'Jikan + starter catalogue'});}catch{return res.json({data:local,source:'Built-in starter catalogue'});}});
app.get('/api/anime/:id',async(req,res)=>{const id=Number(req.params.id);try{const body=await jikan(`https://api.jikan.moe/v4/anime/${id}/full`);return res.json(body.data);}catch{const local=starter.find(a=>a.mal_id===id);if(local)return res.json(local);return res.status(404).json({error:'Details are not available right now.'});}});
app.get('/api/characters',async(req,res)=>{const q=String(req.query.q||'').trim();if(!q)return res.json([]);try{const body=await jikan(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(q)}&limit=18`);res.json(body.data);}catch{res.json([]);}});
app.get('/api/me',(_,res)=>res.json(readDB()));
app.put('/api/preferences',(req,res)=>{const db=readDB();db.preferences={genres:Array.isArray(req.body.genres)?req.body.genres.slice(0,12):[]};writeDB(db);res.json(db.preferences);});
app.post('/api/watchlist',(req,res)=>{const {anime,status='Plan to Watch',rating=0}=req.body;if(!anime||!anime.mal_id||!anime.title)return res.status(400).json({error:'Valid anime details are required.'});const allowed=['Watching','Plan to Watch','Completed','On Hold'];const safeStatus=allowed.includes(status)?status:'Plan to Watch';const db=readDB();const existing=db.watchlist.find(x=>x.anime.mal_id===anime.mal_id);if(existing){existing.anime=anime;existing.status=safeStatus;existing.rating=Math.max(0,Math.min(10,Number(rating)||0));existing.updatedAt=new Date().toISOString();}else db.watchlist.push({anime,status:safeStatus,rating:Math.max(0,Math.min(10,Number(rating)||0)),updatedAt:new Date().toISOString()});writeDB(db);res.json(db.watchlist);});
app.delete('/api/watchlist/:id',(req,res)=>{const db=readDB();db.watchlist=db.watchlist.filter(x=>String(x.anime.mal_id)!==req.params.id);writeDB(db);res.json(db.watchlist);});
app.post('/api/reviews',(req,res)=>{const {title,text,author='Anime fan'}=req.body;if(!title||!text||text.length>500)return res.status(400).json({error:'Add an anime title and a review under 500 characters.'});const db=readDB();db.reviews.unshift({id:Date.now(),title:title.slice(0,100),text,author:String(author).slice(0,40),createdAt:new Date().toISOString()});writeDB(db);res.json(db.reviews);});
app.listen(PORT,()=>console.log(`\n✨ AniVerse is running at http://localhost:${PORT}\n`));
