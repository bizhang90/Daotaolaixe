/* ĐÀO TẠO LÁI XE – BÁO CÁO MARKETING | Final operational build */
const CFG = window.APP_CONFIG || { mode: 'demo' };
const ONLINE = CFG.mode === 'supabase' && CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase;
const cloud = ONLINE ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey) : null;
const LS_KEY = 'dtlx_marketing_final_data';
const SESSION_KEY = 'dtlx_marketing_final_session';
const TABLES = { users:'members', dailyReports:'daily_reports', topics:'content_topics', products:'products', outcomes:'outcomes', otherWorks:'other_work' };
const ROLE_LABEL = { ADMIN:'Quản lý', MEDIA:'Media', TALENT:'Talent', IT_ADS:'IT Ads & Kết quả', IT_SYSTEM:'IT Hệ thống & Báo cáo' };
const AREAS = ['Phan Thiết','La Gi','Bắc Bình','Toàn tỉnh'];
const GOALS = ['Lead','Niềm tin','Tương tác','Thương hiệu','Remarketing','Vận hành'];
const PLATFORMS = ['Facebook','TikTok','YouTube','Website','Facebook Ads','TikTok Ads','Organic','Khác'];
const PRODUCT_TYPES = ['Video ngắn','Video quảng cáo','Video review','Livestream','Poster','Bài đăng','Bộ ảnh'];
const SOURCE_TYPES = ['Tự nghĩ','TikTok','Facebook','YouTube','Comment khách','Thực tế cơ sở','Khác'];
const TARGETS = ['Người đi làm','Phụ nữ','Gia đình','Khách C1','Lái mới','Khách địa phương','Khác'];
const PRODUCT_STATUS = ['Đang làm','Hoàn thành','Đã đăng','Đang chạy Ads','Ngưng sử dụng'];
const WORK_GROUPS = ['Nội dung','Ads','Website','Data','Automation','Công việc khác'];
const OTHER_GROUPS = ['Hỗ trợ sự kiện','Hỗ trợ Sale','Kỹ thuật','Đào tạo','Nghiên cứu','Hỗ trợ nội bộ','Phát sinh khác'];
const OTHER_LEVEL_POINTS = { 'Nhỏ':1, 'Trung bình':2, 'Quan trọng':3, 'Đặc biệt':5 };
let data = loadDemo();
let me = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
let ui = { page:'dashboard', modal:null, quick:false, period:'month', area:'all', member:'all', goal:'all', platform:'all' };
const root = document.getElementById('app');

function today(){ return new Date().toISOString().slice(0,10); }
function daysAgo(n){ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
function uid(prefix){ return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function esc(v=''){ return String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function money(v){ return new Intl.NumberFormat('vi-VN').format(Number(v||0)) + ' đ'; }
function n(v){ return Number(v||0); }
function member(id){ return data.users.find(x=>x.id===id); }
function nameOf(id){ return member(id)?.name || id || '-'; }
function initials(name=''){ return name.split(' ').slice(-2).map(x=>x.charAt(0)).join('').toUpperCase() || 'NV'; }
function isAdmin(){ return me?.role==='ADMIN'; }
function isIT(){ return me?.role==='IT_ADS' || me?.role==='IT_SYSTEM' || isAdmin(); }
function canEnterTopic(){ return isAdmin() || ['MEDIA','TALENT'].includes(me?.role); }
function canEnterOutcome(){ return isAdmin() || me?.role==='IT_ADS'; }
function labelBadge(v){
 const good=['Đã đăng','Hoàn thành','Đã duyệt','Tốt','Đạt']; const warn=['Đang làm','Đang chạy Ads','Chờ duyệt','Chưa tốt']; const bad=['Không tính','Dừng','Ngưng sử dụng','Chưa báo cáo'];
 const cls=good.includes(v)?'good':warn.includes(v)?'warn':bad.includes(v)?'bad':v==='Lead'?'purple':'';
 return `<span class="badge ${cls}">${esc(v)}</span>`;
}
function toast(msg){ const el=document.getElementById('toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2400); }
function saveLocal(){ localStorage.setItem(LS_KEY, JSON.stringify(data)); }
function loadDemo(){ const saved=localStorage.getItem(LS_KEY); if(saved) return JSON.parse(saved); const seeded=seed(); localStorage.setItem(LS_KEY, JSON.stringify(seeded)); return seeded; }
function seed(){
 const users=[
  {id:'ADMIN',name:'Quản lý',role:'ADMIN',password:'123456',kpi:'Tổng hợp và đánh giá',active:true},
  {id:'MEDIA-01',name:'Media 01',role:'MEDIA',password:'123456',kpi:'Nội dung & sản phẩm',active:true},
  {id:'MEDIA-02',name:'Media 02',role:'MEDIA',password:'123456',kpi:'Nội dung & sản phẩm',active:true},
  {id:'MEDIA-03',name:'Media 03',role:'MEDIA',password:'123456',kpi:'Nội dung & sản phẩm',active:true},
  {id:'TALENT-01',name:'Talent 01',role:'TALENT',password:'123456',kpi:'Lên hình & nội dung',active:true},
  {id:'TALENT-02',name:'Talent 02',role:'TALENT',password:'123456',kpi:'Lên hình & nội dung',active:true},
  {id:'IT-01',name:'IT 01',role:'IT_ADS',password:'123456',kpi:'Ads, Lead & Kết quả',active:true},
  {id:'IT-02',name:'IT 02',role:'IT_SYSTEM',password:'123456',kpi:'Hệ thống & báo cáo',active:true}
 ];
 const topics=[
  {id:'CT-001',date:daysAgo(6),author:'MEDIA-01',title:'Người đi làm học lái vào cuối tuần được không?',format:'Video ngắn',source:'Comment khách',sourceLink:'',hook:'Bận đi làm cả tuần thì học lái lúc nào?',target:'Người đi làm',area:'Phan Thiết',goal:'Lead',partner:'TALENT-01',status:'Đã thực hiện',note:'Dạng giải đáp ngắn'},
  {id:'CT-002',date:daysAgo(4),author:'TALENT-02',title:'Buổi đầu cầm vô lăng của một cô gái',format:'Video ngắn',source:'Tự nghĩ',sourceLink:'',hook:'Tôi từng rất sợ khi ngồi vào ghế lái...',target:'Phụ nữ',area:'Toàn tỉnh',goal:'Tương tác',partner:'MEDIA-02',status:'Đã thực hiện',note:'Trải nghiệm tự nhiên'},
  {id:'CT-003',date:daysAgo(2),author:'MEDIA-03',title:'Một buổi thực tế tại văn phòng La Gi',format:'Video review',source:'Thực tế cơ sở',sourceLink:'',hook:'Ở La Gi muốn tìm hiểu học lái, đến đâu?',target:'Khách địa phương',area:'La Gi',goal:'Niềm tin',partner:'TALENT-01',status:'Mới nghiên cứu',note:''}
 ];
 const products=[
  {id:'PT-VIDEO-M01-001',topicId:'CT-001',title:'Người đi làm học lái vào cuối tuần?',owner:'MEDIA-01',partners:['TALENT-01'],talent:'TALENT-01',type:'Video quảng cáo',platform:'Facebook',area:'Phan Thiết',goal:'Lead',workDate:daysAgo(5),postDate:daysAgo(4),link:'https://example.com/video-1',status:'Đang chạy Ads',note:''},
  {id:'ALL-VIDEO-M02-002',topicId:'CT-002',title:'Buổi đầu cầm vô lăng của một cô gái',owner:'MEDIA-02',partners:['TALENT-02'],talent:'TALENT-02',type:'Video ngắn',platform:'TikTok',area:'Toàn tỉnh',goal:'Tương tác',workDate:daysAgo(3),postDate:daysAgo(2),link:'https://example.com/video-2',status:'Đã đăng',note:''},
  {id:'LG-VIDEO-M03-003',topicId:'CT-003',title:'Một buổi tại văn phòng La Gi',owner:'MEDIA-03',partners:['TALENT-01'],talent:'TALENT-01',type:'Video review',platform:'Facebook',area:'La Gi',goal:'Niềm tin',workDate:daysAgo(1),postDate:'',link:'',status:'Đang làm',note:''}
 ];
 const outcomes=[
  {id:'RS-001',date:daysAgo(3),productId:'PT-VIDEO-M01-001',platform:'Facebook Ads',area:'Phan Thiết',budget:850000,reach:18500,views:5200,engagement:287,messages:31,leads:14,enrollments:2,rating:'Tốt',note:'Tiếp tục test hook'},
  {id:'RS-002',date:daysAgo(1),productId:'ALL-VIDEO-M02-002',platform:'Organic',area:'Toàn tỉnh',budget:0,reach:8200,views:6500,engagement:411,messages:7,leads:3,enrollments:0,rating:'Đạt',note:'Dùng remarketing'}
 ];
 const dailyReports=[
  {id:'DR-001',date:today(),userId:'MEDIA-01',group:'Nội dung',work:'Dựng thêm phiên bản hook cho video người đi làm',productId:'PT-VIDEO-M01-001',hours:4,result:'Đã hoàn thiện bản cắt 25 giây',proof:'https://example.com/video-1',difficulty:'Không',tomorrow:'Theo dõi phản hồi Ads'},
  {id:'DR-002',date:today(),userId:'IT-01',group:'Ads',work:'Nhập kết quả và kiểm tra CPL chiến dịch Phan Thiết',productId:'PT-VIDEO-M01-001',hours:3,result:'Đã có số liệu lead',proof:'',difficulty:'Không',tomorrow:'Theo dõi tỷ lệ hồ sơ'},
  {id:'DR-003',date:daysAgo(1),userId:'TALENT-02',group:'Nội dung',work:'Quay clip trải nghiệm lái mới',productId:'ALL-VIDEO-M02-002',hours:3,result:'Hoàn thành lên hình',proof:'https://example.com/video-2',difficulty:'Cần thêm cảnh sân tập',tomorrow:'Tìm chủ đề mới'}
 ];
 const otherWorks=[
  {id:'OW-001',date:today(),userId:'MEDIA-03',group:'Hỗ trợ Sale',title:'Quay bổ sung cảnh sân tập gửi khách',reason:'Sale cần tư liệu hỗ trợ tư vấn',requester:'Sale',hours:2,result:'10 cảnh raw',proof:'',value:'Nội dung',level:'Trung bình',points:2,status:'Chờ duyệt',comment:''},
  {id:'OW-002',date:daysAgo(2),userId:'IT-02',group:'Kỹ thuật',title:'Sửa form đăng ký landing page',reason:'Lỗi gửi form',requester:'Quản lý',hours:2,result:'Form hoạt động lại',proof:'',value:'Kỹ thuật',level:'Quan trọng',points:3,status:'Đã duyệt',comment:'Xử lý kịp thời'}
 ];
 return { users, topics, products, outcomes, dailyReports, otherWorks };
}

async function cloudLoad(){
 if(!ONLINE || !me) return;
 const entries = await Promise.all(Object.entries(TABLES).map(async ([key,table])=>{
   const {data:rows,error}=await cloud.from(table).select('record').order('updated_at',{ascending:false});
   if(error) throw error;
   return [key, rows.map(r=>r.record)];
 }));
 const pulled=Object.fromEntries(entries);
 for(const key of Object.keys(TABLES)) data[key]=pulled[key] || [];
 saveLocal();
}
function ownerFor(key, record){
 if(key==='topics') return record.author;
 if(key==='products') return record.owner;
 if(key==='outcomes') return me?.id || 'IT-01';
 return record.userId || me?.id || 'ADMIN';
}
async function persist(key, record){
 const list=data[key]; const idx=list.findIndex(x=>x.id===record.id); if(idx>=0) list[idx]=record; else list.unshift(record); saveLocal();
 if(ONLINE){
  const table=TABLES[key]; const payload={record_id:record.id,owner_code:ownerFor(key,record),record,updated_at:new Date().toISOString()};
  const {error}=await cloud.from(table).upsert(payload,{onConflict:'record_id'}); if(error) throw error;
 }
}
async function erase(key,id){
 data[key]=data[key].filter(x=>x.id!==id); saveLocal();
 if(ONLINE){ const {error}=await cloud.from(TABLES[key]).delete().eq('record_id',id); if(error) throw error; }
}

function startDate(){ const d=new Date(); if(ui.period==='today') return today(); if(ui.period==='week'){ d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); } if(ui.period==='month'){ d.setDate(d.getDate()-29); return d.toISOString().slice(0,10); } return '2000-01-01'; }
function dateInPeriod(date){ return !date || date>=startDate(); }
function matchFilters(x, dateKey='date'){
 if(x[dateKey] && !dateInPeriod(x[dateKey])) return false;
 if(ui.area!=='all' && x.area && x.area!==ui.area) return false;
 if(ui.goal!=='all' && x.goal && x.goal!==ui.goal) return false;
 if(ui.platform!=='all' && x.platform && x.platform!==ui.platform) return false;
 if(ui.member!=='all'){
  const values=[x.userId,x.author,x.owner,x.talent,...(x.partners||[])]; if(!values.includes(ui.member)) return false;
 }
 return true;
}
function matchOutcome(o){
 if(o.date && !dateInPeriod(o.date)) return false;
 if(ui.area!=='all' && o.area!==ui.area) return false;
 if(ui.platform!=='all' && o.platform!==ui.platform) return false;
 const p=data.products.find(x=>x.id===o.productId);
 if(ui.goal!=='all' && p?.goal!==ui.goal) return false;
 if(ui.member!=='all'){ const people=[p?.owner,p?.talent,...(p?.partners||[])]; if(!people.includes(ui.member)) return false; }
 return true;
}
function relevant(items, ownerFields=[]){
 if(isAdmin() || isIT()) return items;
 return items.filter(x=>ownerFields.some(field=>Array.isArray(x[field])?x[field].includes(me.id):x[field]===me.id));
}
function selected(v, current){ return v===current?' selected':''; }
function opts(items,current=''){ return items.map(x=>`<option value="${esc(x)}"${selected(x,current)}>${esc(x)}</option>`).join(''); }
function statusClass(status){ return ['Đã đăng','Hoàn thành','Đã duyệt','Tốt','Đạt','Đã thực hiện'].includes(status)?'good':['Đang làm','Đang chạy Ads','Chờ duyệt','Mới nghiên cứu','Chưa tốt'].includes(status)?'warn':['Dừng','Ngưng sử dụng','Không tính'].includes(status)?'bad':''; }
function badge(status){ return `<span class="badge ${statusClass(status)}">${esc(status)}</span>`; }
function outcomeMetrics(outcomes){
 return outcomes.reduce((a,x)=>{a.budget+=n(x.budget);a.reach+=n(x.reach);a.views+=n(x.views);a.engagement+=n(x.engagement);a.messages+=n(x.messages);a.leads+=n(x.leads);a.enrollments+=n(x.enrollments);return a;},{budget:0,reach:0,views:0,engagement:0,messages:0,leads:0,enrollments:0});
}
function productOutcome(productId){ return outcomeMetrics(data.outcomes.filter(o=>o.productId===productId)); }
function memberStats(u){
 const topics=data.topics.filter(t=>t.author===u.id && dateInPeriod(t.date));
 const products=data.products.filter(p=>(p.owner===u.id || p.talent===u.id || (p.partners||[]).includes(u.id)) && dateInPeriod(p.workDate));
 const ids=products.map(p=>p.id); const results=data.outcomes.filter(o=>ids.includes(o.productId) && dateInPeriod(o.date)); const met=outcomeMetrics(results);
 const other=data.otherWorks.filter(w=>w.userId===u.id && w.status==='Đã duyệt' && dateInPeriod(w.date));
 const reports=data.dailyReports.filter(r=>r.userId===u.id && dateInPeriod(r.date));
 const score=Math.min(100, topics.length*4 + products.filter(p=>['Hoàn thành','Đã đăng','Đang chạy Ads'].includes(p.status)).length*9 + met.leads*2 + met.enrollments*6 + other.reduce((s,x)=>s+n(x.points),0)*2 + reports.length*2);
 return {topics:topics.length,products:products.length,posted:products.filter(p=>['Đã đăng','Đang chạy Ads'].includes(p.status)).length,ads:products.filter(p=>p.status==='Đang chạy Ads').length,leads:met.leads,enrollments:met.enrollments,other:other.reduce((s,x)=>s+n(x.points),0),reports:reports.length,score};
}

function loginView(){
 const demoOpts=data.users.filter(u=>u.active).map(u=>`<option value="${u.id}">${u.id} — ${u.name}</option>`).join('');
 return `<div class="login"><section class="login-brand"><div><div class="brand"><span class="wheel">🚘</span> ĐÀO TẠO LÁI XE</div><h1>Báo Cáo<br>Marketing</h1><p>Ghi nhận công việc thật, nội dung tự nghiên cứu, sản phẩm đã thực hiện và kết quả Marketing của đội ngũ.</p></div><div class="chips"><span>3 Media</span><span>2 Talent</span><span>2 IT</span><span>KPI thực tế</span></div></section><section class="login-form"><form id="loginForm" class="auth-card"><h2>Đăng nhập</h2><p class="hint">${ONLINE?'Sử dụng email và mật khẩu đã cấp cho nhân sự.':'Bản chạy thử dùng tài khoản demo để kiểm tra toàn bộ quy trình.'}</p>${ONLINE?`<div class="field"><label>Email</label><input name="email" type="email" required></div>`:`<div class="field"><label>Tài khoản</label><select name="userId">${demoOpts}</select></div>`}<div class="field"><label>Mật khẩu</label><input name="password" type="password" value="${ONLINE?'':'123456'}" required></div><button class="btn btn-primary btn-full">Đăng nhập</button>${ONLINE?'':`<div class="demo-account"><b>Mật khẩu demo:</b> 123456<br>Chọn <b>ADMIN</b> để xem báo cáo tổng; chọn từng nhân sự để kiểm tra màn hình nhập liệu cá nhân.</div>`}</form></section></div>`;
}
function navItems(){
 const all=[['dashboard','▦','Tổng quan'],['daily','✓','Báo cáo hôm nay'],['topics','💡','Nội dung nghiên cứu'],['products','▶','Sản phẩm thực hiện'],['outcomes','↗','Ads & Kết quả'],['other','＋','Công việc khác'],['members','◎','Thành viên & KPI'],['reports','▤','Báo cáo tổng hợp']];
 return all.filter(([key])=>{
  if(key==='outcomes') return isIT() || me?.role==='MEDIA' || me?.role==='TALENT';
  if(['members','reports'].includes(key)) return isAdmin() || isIT();
  return true;
 });
}
function shell(body){
 const items=navItems(); const title=items.find(i=>i[0]===ui.page)?.[2] || 'Tổng quan';
 const nav=items.map(([key,icon,label])=>`<button data-nav="${key}" class="${ui.page===key?'active':''}"><span class="icon">${icon}</span>${label}</button>`).join('');
 const mobile=[['dashboard','▦','Tổng'],['daily','✓','Báo cáo'],['topics','💡','Chủ đề'],['products','▶','Sản phẩm'],['outcomes','↗','Kết quả']].filter(x=>items.some(i=>i[0]===x[0])).map(([key,icon,label])=>`<button data-nav="${key}" class="${ui.page===key?'active':''}"><span class="icon">${icon}</span>${label}</button>`).join('');
 return `<div class="shell"><aside class="sidebar"><div class="brand"><span class="wheel">🚘</span> ĐÀO TẠO LÁI XE</div><nav class="nav">${nav}</nav><div class="profile-box"><div class="profile-row"><span class="avatar">${initials(me.name)}</span><div><strong>${esc(me.name)}</strong><small>${esc(ROLE_LABEL[me.role])}</small></div></div><button id="logout" class="btn btn-full">Đăng xuất</button></div></aside><main class="main"><header class="topbar"><div><h2>${esc(title)}</h2><p>Báo cáo Marketing · Dữ liệu theo kết quả thực tế</p></div><div class="top-actions"><span class="badge ${ONLINE?'good':''}">${ONLINE?'Online':'Demo'}</span><button class="btn label-hide" onclick="window.print()">In báo cáo</button></div></header><section class="content">${body}</section></main><nav class="mobile-nav">${mobile}</nav>${quickAdd()}</div>${ui.modal?modalView():''}`;
}
function quickAdd(){
 if(ui.page==='members'||ui.page==='reports') return '';
 const choices=[];
 choices.push(['daily','Báo cáo hôm nay']);
 if(canEnterTopic()) choices.push(['topic','Chủ đề nghiên cứu']);
 choices.push(['product','Sản phẩm thực hiện']);
 if(canEnterOutcome()) choices.push(['outcome','Ads & Kết quả']);
 choices.push(['other','Công việc khác']);
 return `${ui.quick?`<div class="quick-menu">${choices.map(x=>`<button data-open="${x[0]}">+ ${x[1]}</button>`).join('')}</div>`:''}<button class="quick-add" id="quickBtn">${ui.quick?'×':'+'}</button>`;
}
function filters(showPlatform=false){
 const userOptions=data.users.filter(u=>u.role!=='ADMIN').map(u=>`<option value="${u.id}"${selected(u.id,ui.member)}>${esc(u.name)}</option>`).join('');
 return `<div class="filterbar"><select id="period"><option value="today"${selected('today',ui.period)}>Hôm nay</option><option value="week"${selected('week',ui.period)}>7 ngày</option><option value="month"${selected('month',ui.period)}>30 ngày</option><option value="all"${selected('all',ui.period)}>Tất cả</option></select><select id="filterArea"><option value="all">Tất cả khu vực</option>${AREAS.map(a=>`<option value="${a}"${selected(a,ui.area)}>${a}</option>`).join('')}</select><select id="filterMember"><option value="all">Tất cả nhân sự</option>${userOptions}</select><select id="filterGoal"><option value="all">Tất cả mục tiêu</option>${GOALS.map(g=>`<option value="${g}"${selected(g,ui.goal)}>${g}</option>`).join('')}</select>${showPlatform?`<select id="filterPlatform"><option value="all">Tất cả nền tảng</option>${PLATFORMS.map(p=>`<option value="${p}"${selected(p,ui.platform)}>${p}</option>`).join('')}</select>`:''}<div class="right"><button class="btn btn-small" data-reset-filter>Làm mới lọc</button></div></div>`;
}
function dashboardView(){
 const topics=data.topics.filter(x=>matchFilters(x,'date'));
 const products=data.products.filter(x=>matchFilters(x,'workDate'));
 const outcomes=data.outcomes.filter(matchOutcome);
 const reports=data.dailyReports.filter(r=>dateInPeriod(r.date));
 const met=outcomeMetrics(outcomes);
 const reportedToday=new Set(data.dailyReports.filter(r=>r.date===today()).map(r=>r.userId));
 const active=data.users.filter(u=>u.active && u.role!=='ADMIN'); const missing=active.filter(u=>!reportedToday.has(u.id));
 const pending=data.otherWorks.filter(w=>w.status==='Chờ duyệt');
 const topProducts=products.map(p=>({p,m:productOutcome(p.id)})).sort((a,b)=>(b.m.enrollments-a.m.enrollments)||(b.m.leads-a.m.leads)).slice(0,5);
 const byMember=active.map(u=>({name:u.name,value:memberStats(u).products}));
 const leadByMember=active.map(u=>({name:u.name,value:memberStats(u).leads}));
 return `${filters(true)}<div class="metrics"><div class="metric"><div class="label">Đã báo cáo hôm nay</div><div class="value">${reportedToday.size}/${active.length}</div><div class="note">Nhân sự hoạt động</div></div><div class="metric attn"><div class="label">Chưa báo cáo</div><div class="value">${missing.length}</div><div class="note">Cần theo dõi</div></div><div class="metric"><div class="label">Chủ đề nghiên cứu</div><div class="value">${topics.length}</div><div class="note">Trong kỳ lọc</div></div><div class="metric"><div class="label">Sản phẩm đã đăng</div><div class="value">${products.filter(p=>['Đã đăng','Đang chạy Ads'].includes(p.status)).length}</div><div class="note">Đầu ra thật</div></div><div class="metric"><div class="label">Lead có thông tin</div><div class="value">${met.leads}</div><div class="note">Từ Marketing</div></div><div class="metric"><div class="label">Hồ sơ đăng ký</div><div class="value">${met.enrollments}</div><div class="note">Kết quả cuối</div></div></div><div class="grid-2"><article class="panel"><div class="panel-head"><div><h3>Sản phẩm nổi bật</h3><p>Xếp theo hồ sơ và lead ghi nhận</p></div></div><div class="tablebox"><table><thead><tr><th>Sản phẩm</th><th>Người thực hiện</th><th>Lead</th><th>Hồ sơ</th><th>Trạng thái</th></tr></thead><tbody>${topProducts.length?topProducts.map(({p,m})=>`<tr><td><strong>${esc(p.title)}</strong><div class="sub">${esc(p.id)} · ${esc(p.area)}</div></td><td>${esc(nameOf(p.owner))}</td><td>${m.leads}</td><td>${m.enrollments}</td><td>${badge(p.status)}</td></tr>`).join(''):`<tr><td colspan="5" class="empty">Chưa có dữ liệu.</td></tr>`}</tbody></table></div></article><article class="panel"><div class="panel-head"><div><h3>Cần xử lý hôm nay</h3><p>Báo cáo và duyệt phát sinh</p></div></div><div class="stack"><div class="item"><div class="item-row"><strong>Nhân sự chưa báo cáo</strong>${badge(missing.length?'Chưa báo cáo':'Hoàn thành')}</div><p>${missing.length?missing.map(u=>u.name).join(', '):'Tất cả nhân sự đã có báo cáo hôm nay.'}</p></div><div class="item"><div class="item-row"><strong>Công việc khác chờ duyệt</strong><span class="badge warn">${pending.length}</span></div><p>${pending.length?pending.slice(0,3).map(w=>nameOf(w.userId)+': '+w.title).join(' · '):'Không có công việc chờ duyệt.'}</p></div><div class="item"><div class="item-row"><strong>Ngân sách trong kỳ</strong><b>${money(met.budget)}</b></div><p>CPL: ${met.leads?money(met.budget/met.leads):'-'} · Chi phí/hồ sơ: ${met.enrollments?money(met.budget/met.enrollments):'-'}</p></div></div></article></div><div class="grid-even"><article class="panel"><div class="panel-head"><h3>Sản lượng theo nhân sự</h3></div>${barChart(byMember)}</article><article class="panel"><div class="panel-head"><h3>Lead theo nội dung có thành viên tham gia</h3></div>${barChart(leadByMember,true)}</article></div>`;
}
function barChart(rows,gold=false){ const max=Math.max(1,...rows.map(x=>x.value)); return `<div class="bar-list">${rows.map(x=>`<div class="bar-row"><span>${esc(x.name)}</span><div class="bar-track"><div class="bar-fill ${gold?'gold':''}" style="width:${Math.round(x.value/max*100)}%"></div></div><b>${x.value}</b></div>`).join('')}</div>`; }
function dailyView(){
 let rows=relevant(data.dailyReports,['userId']).filter(r=>dateInPeriod(r.date)); if(ui.member!=='all') rows=rows.filter(r=>r.userId===ui.member);
 const todayRows=data.dailyReports.filter(r=>r.date===today()); const usersDone=new Set(todayRows.map(r=>r.userId));
 return `${filters()}<article class="panel"><div class="panel-head"><div><h3>Báo cáo công việc hằng ngày</h3><p>Mỗi thành viên có thể thêm nhiều dòng việc trong một ngày</p></div><button class="btn btn-primary" data-open="daily">+ Nhập báo cáo</button></div><div class="tablebox"><table><thead><tr><th>Ngày</th><th>Nhân sự</th><th>Công việc</th><th>Kết quả</th><th>Thời gian</th><th>Kế hoạch tiếp theo</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${esc(r.date)}</td><td><strong>${esc(nameOf(r.userId))}</strong><div class="sub">${esc(r.group)}</div></td><td>${esc(r.work)}${r.productId?`<div class="sub">${esc(r.productId)}</div>`:''}</td><td>${esc(r.result)}${r.proof?`<div class="sub"><a href="${esc(r.proof)}" target="_blank">Xem minh chứng</a></div>`:''}</td><td>${r.hours} giờ</td><td>${esc(r.tomorrow||'-')}<div class="sub">Vướng mắc: ${esc(r.difficulty||'Không')}</div></td></tr>`).join(''):`<tr><td colspan="6" class="empty">Chưa có báo cáo trong kỳ.</td></tr>`}</tbody></table></div></article>${isAdmin()?`<div class="grid-even" style="margin-top:16px"><article class="panel"><div class="panel-head"><h3>Đã báo cáo hôm nay</h3></div><div class="stack">${data.users.filter(u=>u.role!=='ADMIN'&&usersDone.has(u.id)).map(u=>`<div class="item"><div class="item-row"><strong>${esc(u.name)}</strong>${badge('Hoàn thành')}</div></div>`).join('')||'<div class="empty">Chưa có ai báo cáo.</div>'}</div></article><article class="panel"><div class="panel-head"><h3>Chưa báo cáo hôm nay</h3></div><div class="stack">${data.users.filter(u=>u.role!=='ADMIN'&&!usersDone.has(u.id)).map(u=>`<div class="item"><div class="item-row"><strong>${esc(u.name)}</strong>${badge('Chưa báo cáo')}</div></div>`).join('')||'<div class="empty">Không còn cảnh báo.</div>'}</div></article></div>`:''}`;
}
function topicsView(){
 let rows=relevant(data.topics,['author','partner']).filter(t=>matchFilters(t,'date'));
 return `${filters()}<article class="panel"><div class="panel-head"><div><h3>Nội dung tự nghiên cứu</h3><p>Media và Talent tự ghi nhận chủ đề tìm được; đánh giá dựa trên sản phẩm và kết quả sau đó</p></div>${canEnterTopic()?'<button class="btn btn-primary" data-open="topic">+ Thêm chủ đề</button>':''}</div><div class="tablebox"><table><thead><tr><th>Chủ đề / Hook</th><th>Người đề xuất</th><th>Khách hàng</th><th>Khu vực</th><th>Mục tiêu</th><th>Trạng thái</th></tr></thead><tbody>${rows.length?rows.map(t=>`<tr><td><strong>${esc(t.title)}</strong><div class="sub">${esc(t.hook||'Chưa có hook')} · Nguồn: ${esc(t.source)}</div></td><td>${esc(nameOf(t.author))}<div class="sub">${esc(t.date)}</div></td><td>${esc(t.target)}</td><td>${esc(t.area)}</td><td>${labelBadge(t.goal)}</td><td>${badge(t.status)}</td></tr>`).join(''):`<tr><td colspan="6" class="empty">Chưa có chủ đề phù hợp bộ lọc.</td></tr>`}</tbody></table></div></article>`;
}
function productsView(){
 let rows=relevant(data.products,['owner','partners','talent']).filter(p=>matchFilters(p,'workDate'));
 return `${filters(true)}<article class="panel"><div class="panel-head"><div><h3>Sản phẩm đã thực hiện</h3><p>Video, poster, livestream, bài đăng và các đầu ra thực tế</p></div><button class="btn btn-primary" data-open="product">+ Thêm sản phẩm</button></div><div class="tablebox"><table><thead><tr><th>Mã / Sản phẩm</th><th>Người thực hiện</th><th>Nền tảng</th><th>Mục tiêu</th><th>Ngày đăng</th><th>Kết quả</th><th>Trạng thái</th></tr></thead><tbody>${rows.length?rows.map(p=>{const m=productOutcome(p.id);return `<tr><td><strong>${esc(p.title)}</strong><div class="sub">${esc(p.id)} · ${esc(p.type)}</div></td><td>${esc(nameOf(p.owner))}<div class="sub">Talent: ${esc(nameOf(p.talent))}</div></td><td>${esc(p.platform)}<div class="sub">${esc(p.area)}</div></td><td>${labelBadge(p.goal)}</td><td>${esc(p.postDate||'Chưa đăng')}${p.link?`<div class="sub"><a href="${esc(p.link)}" target="_blank">Mở link</a></div>`:''}</td><td>${m.leads} lead · ${m.enrollments} hồ sơ</td><td>${badge(p.status)}</td></tr>`;}).join(''):`<tr><td colspan="7" class="empty">Chưa có sản phẩm.</td></tr>`}</tbody></table></div></article>`;
}
function outcomesView(){
 let rows=data.outcomes.filter(matchOutcome); if(!isIT() && !isAdmin()){ const ids=data.products.filter(p=>p.owner===me.id||p.talent===me.id||(p.partners||[]).includes(me.id)).map(p=>p.id); rows=rows.filter(o=>ids.includes(o.productId)); }
 const m=outcomeMetrics(rows);
 return `${filters(true)}<div class="metrics"><div class="metric"><div class="label">Ngân sách</div><div class="value" style="font-size:23px">${money(m.budget)}</div></div><div class="metric"><div class="label">Tin nhắn</div><div class="value">${m.messages}</div></div><div class="metric"><div class="label">Lead</div><div class="value">${m.leads}</div></div><div class="metric"><div class="label">Hồ sơ</div><div class="value">${m.enrollments}</div></div><div class="metric"><div class="label">CPL</div><div class="value" style="font-size:22px">${m.leads?money(m.budget/m.leads):'-'}</div></div><div class="metric"><div class="label">Chi phí/hồ sơ</div><div class="value" style="font-size:22px">${m.enrollments?money(m.budget/m.enrollments):'-'}</div></div></div><article class="panel"><div class="panel-head"><div><h3>Quảng cáo & Kết quả nội dung</h3><p>Media/Talent xem kết quả sản phẩm liên quan; IT/Admin nhập dữ liệu</p></div>${canEnterOutcome()?'<button class="btn btn-primary" data-open="outcome">+ Nhập kết quả</button>':''}</div><div class="tablebox"><table><thead><tr><th>Ngày / Sản phẩm</th><th>Nền tảng</th><th>Chi phí</th><th>Tin nhắn</th><th>Lead</th><th>Hồ sơ</th><th>CPL</th><th>Đánh giá</th></tr></thead><tbody>${rows.length?rows.map(o=>{const p=data.products.find(x=>x.id===o.productId);return `<tr><td><strong>${esc(p?.title||o.productId)}</strong><div class="sub">${esc(o.date)} · ${esc(o.area)}</div></td><td>${esc(o.platform)}</td><td>${money(o.budget)}</td><td>${n(o.messages)}</td><td>${n(o.leads)}</td><td>${n(o.enrollments)}</td><td>${o.leads?money(o.budget/o.leads):'-'}</td><td>${badge(o.rating)}</td></tr>`;}).join(''):`<tr><td colspan="8" class="empty">Chưa có số liệu kết quả.</td></tr>`}</tbody></table></div></article>`;
}
function otherView(){
 let rows=relevant(data.otherWorks,['userId']).filter(w=>dateInPeriod(w.date)); if(ui.member!=='all') rows=rows.filter(w=>w.userId===ui.member);
 return `${filters()}<article class="panel"><div class="panel-head"><div><h3>Công việc khác</h3><p>Việc phát sinh chỉ tính điểm sau khi quản lý duyệt</p></div><button class="btn btn-primary" data-open="other">+ Báo cáo phát sinh</button></div><div class="tablebox"><table><thead><tr><th>Ngày / Người làm</th><th>Công việc</th><th>Kết quả</th><th>Thời gian</th><th>Mức độ</th><th>Điểm</th><th>Trạng thái</th><th></th></tr></thead><tbody>${rows.length?rows.map(w=>`<tr><td><strong>${esc(nameOf(w.userId))}</strong><div class="sub">${esc(w.date)} · ${esc(w.group)}</div></td><td><strong>${esc(w.title)}</strong><div class="sub">Lý do: ${esc(w.reason)}</div></td><td>${esc(w.result)}${w.proof?`<div class="sub"><a href="${esc(w.proof)}" target="_blank">Minh chứng</a></div>`:''}</td><td>${w.hours} giờ</td><td>${esc(w.level)}</td><td>${w.status==='Đã duyệt'?w.points:0}</td><td>${badge(w.status)}</td><td>${isAdmin()&&w.status==='Chờ duyệt'?`<button class="btn btn-small btn-primary" data-approve="${w.id}">Duyệt</button> <button class="btn btn-small btn-danger" data-reject="${w.id}">Không tính</button>`:''}</td></tr>`).join(''):`<tr><td colspan="8" class="empty">Chưa có công việc khác.</td></tr>`}</tbody></table></div></article>`;
}
function membersView(){
 const users=data.users.filter(u=>u.role!=='ADMIN');
 return `${filters()}<article class="panel"><div class="panel-head"><div><h3>Thành viên & KPI</h3><p>Điểm tham chiếu dựa trên sản phẩm, kết quả và kỷ luật báo cáo trong kỳ</p></div>${isAdmin()?'<button class="btn" data-open="member">+ Thêm nhân sự</button>':''}</div><div class="kpi-cards">${users.map(u=>{const s=memberStats(u);return `<div class="kpi-card"><header><div><h4>${esc(u.name)}</h4><span class="badge">${esc(ROLE_LABEL[u.role])}</span></div><div class="score">${s.score}</div></header><div class="kpi-stats"><div class="kpi-stat"><span>Chủ đề</span><b>${s.topics}</b></div><div class="kpi-stat"><span>Sản phẩm</span><b>${s.products}</b></div><div class="kpi-stat"><span>Đã đăng</span><b>${s.posted}</b></div><div class="kpi-stat"><span>Lead</span><b>${s.leads}</b></div><div class="kpi-stat"><span>Hồ sơ</span><b>${s.enrollments}</b></div><div class="kpi-stat"><span>Điểm phát sinh</span><b>${s.other}</b></div></div>${isAdmin()?`<div style="margin-top:12px"><button class="btn btn-small" data-edit-member="${u.id}">Chỉnh nhân sự</button></div>`:''}</div>`;}).join('')}</div></article>`;
}
function reportsView(){
 const products=data.products.filter(p=>matchFilters(p,'workDate')); const outcomes=data.outcomes.filter(matchOutcome); const metrics=outcomeMetrics(outcomes); const users=data.users.filter(u=>u.role!=='ADMIN');
 const best=products.map(p=>({p,m:productOutcome(p.id)})).sort((a,b)=>(b.m.enrollments-a.m.enrollments)||(b.m.leads-a.m.leads)).slice(0,10);
 return `<div class="print-title"><h1>ĐÀO TẠO LÁI XE – BÁO CÁO MARKETING</h1></div>${filters(true)}<div class="panel" style="margin-bottom:16px"><div class="panel-head"><div><h3>Báo cáo tổng hợp</h3><p>Dùng bộ lọc phía trên để xuất báo cáo ngày, tuần hoặc tháng</p></div><div class="panel-actions"><button class="btn" data-export="kpi">Xuất KPI CSV</button><button class="btn" data-export="products">Xuất sản phẩm CSV</button><button class="btn" onclick="window.print()">In / Lưu PDF</button></div></div><div class="metrics" style="margin-bottom:0"><div class="metric"><div class="label">Sản phẩm</div><div class="value">${products.length}</div></div><div class="metric"><div class="label">Ngân sách</div><div class="value" style="font-size:22px">${money(metrics.budget)}</div></div><div class="metric"><div class="label">Lead</div><div class="value">${metrics.leads}</div></div><div class="metric"><div class="label">Hồ sơ</div><div class="value">${metrics.enrollments}</div></div><div class="metric"><div class="label">CPL</div><div class="value" style="font-size:22px">${metrics.leads?money(metrics.budget/metrics.leads):'-'}</div></div><div class="metric"><div class="label">Chi phí/hồ sơ</div><div class="value" style="font-size:21px">${metrics.enrollments?money(metrics.budget/metrics.enrollments):'-'}</div></div></div></div><div class="grid-even"><article class="panel"><div class="panel-head"><h3>Top sản phẩm trong kỳ</h3></div><div class="tablebox"><table><thead><tr><th>Sản phẩm</th><th>Lead</th><th>Hồ sơ</th><th>Người làm</th></tr></thead><tbody>${best.map(({p,m})=>`<tr><td>${esc(p.title)}</td><td>${m.leads}</td><td>${m.enrollments}</td><td>${esc(nameOf(p.owner))}</td></tr>`).join('')||'<tr><td colspan="4" class="empty">Chưa có sản phẩm.</td></tr>'}</tbody></table></div></article><article class="panel"><div class="panel-head"><h3>KPI nhân sự</h3></div><div class="tablebox"><table><thead><tr><th>Thành viên</th><th>Sản phẩm</th><th>Lead</th><th>Hồ sơ</th><th>Điểm</th></tr></thead><tbody>${users.map(u=>{const s=memberStats(u);return `<tr><td>${esc(u.name)}</td><td>${s.products}</td><td>${s.leads}</td><td>${s.enrollments}</td><td><strong>${s.score}</strong></td></tr>`;}).join('')}</tbody></table></div></article></div>`;
}
function mainView(){ switch(ui.page){ case 'daily':return dailyView(); case 'topics':return topicsView(); case 'products':return productsView(); case 'outcomes':return outcomesView(); case 'other':return otherView(); case 'members':return membersView(); case 'reports':return reportsView(); default:return dashboardView(); } }

function modalView(){
 let title='', body=''; const close='<div class="modal-actions"><button type="button" class="btn" data-close>Huỷ</button><button class="btn btn-primary" type="submit">Lưu dữ liệu</button></div>';
 if(ui.modal==='daily'){
  title='Nhập báo cáo hôm nay'; body=`<form id="dailyForm"><div class="form-grid"><div class="field"><label>Ngày</label><input name="date" type="date" value="${today()}" required></div><div class="field"><label>Nhóm công việc</label><select name="group">${opts(WORK_GROUPS)}</select></div><div class="field wide"><label>Công việc đã làm</label><input name="work" required></div><div class="field"><label>Sản phẩm liên quan</label><select name="productId"><option value="">Không gắn sản phẩm</option>${data.products.map(p=>`<option value="${p.id}">${esc(p.id)} — ${esc(p.title)}</option>`).join('')}</select></div><div class="field"><label>Thời gian thực hiện (giờ)</label><input name="hours" type="number" min="0.5" step="0.5" required></div><div class="field wide"><label>Kết quả hôm nay</label><input name="result" required></div><div class="field"><label>Link minh chứng</label><input name="proof" type="url" placeholder="https://..."></div><div class="field"><label>Khó khăn</label><input name="difficulty" value="Không"></div><div class="field wide"><label>Ưu tiên ngày mai</label><input name="tomorrow" required></div></div>${close}</form>`;
 }
 if(ui.modal==='topic'){
  title='Thêm chủ đề tự nghiên cứu'; body=`<form id="topicForm"><div class="form-grid"><div class="field"><label>Ngày nghiên cứu</label><input name="date" type="date" value="${today()}" required></div><div class="field"><label>Loại nội dung</label><select name="format">${opts(PRODUCT_TYPES)}</select></div><div class="field wide"><label>Tên chủ đề</label><input name="title" required></div><div class="field wide"><label>Hook dự kiến</label><input name="hook" placeholder="Câu mở đầu 3 giây đầu..."></div><div class="field"><label>Nguồn ý tưởng</label><select name="source">${opts(SOURCE_TYPES)}</select></div><div class="field"><label>Link tham khảo</label><input name="sourceLink" type="url" placeholder="https://..."></div><div class="field"><label>Khách hàng mục tiêu</label><select name="target">${opts(TARGETS)}</select></div><div class="field"><label>Khu vực</label><select name="area">${opts(AREAS)}</select></div><div class="field"><label>Mục tiêu</label><select name="goal">${opts(GOALS)}</select></div><div class="field"><label>Người phối hợp dự kiến</label><select name="partner"><option value="">Chưa chọn</option>${data.users.filter(u=>u.role!=='ADMIN'&&u.id!==me.id).map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></div><div class="field"><label>Trạng thái</label><select name="status"><option>Mới nghiên cứu</option><option>Đã thực hiện</option><option>Không thực hiện</option></select></div><div class="field wide"><label>Ghi chú triển khai</label><textarea name="note"></textarea></div></div>${close}</form>`;
 }
 if(ui.modal==='product'){
  title='Thêm sản phẩm đã thực hiện'; body=`<form id="productForm"><div class="form-grid"><div class="field wide"><label>Tên sản phẩm</label><input name="title" required></div><div class="field"><label>Chủ đề nguồn</label><select name="topicId"><option value="">Không liên kết</option>${data.topics.map(t=>`<option value="${t.id}">${esc(t.title)}</option>`).join('')}</select></div><div class="field"><label>Người thực hiện chính</label><select name="owner">${(isAdmin()?data.users.filter(u=>u.role!=='ADMIN'):[me]).map(u=>`<option value="${u.id}"${selected(u.id,me.id)}>${esc(u.name)}</option>`).join('')}</select></div><div class="field"><label>Talent xuất hiện</label><select name="talent"><option value="">Không có</option>${data.users.filter(u=>u.role==='TALENT').map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select></div><div class="field"><label>Loại sản phẩm</label><select name="type">${opts(PRODUCT_TYPES)}</select></div><div class="field"><label>Nền tảng đăng</label><select name="platform">${opts(PLATFORMS.slice(0,4))}</select></div><div class="field"><label>Khu vực</label><select name="area">${opts(AREAS)}</select></div><div class="field"><label>Mục tiêu</label><select name="goal">${opts(GOALS)}</select></div><div class="field"><label>Ngày thực hiện</label><input name="workDate" type="date" value="${today()}" required></div><div class="field"><label>Ngày đăng</label><input name="postDate" type="date"></div><div class="field"><label>Trạng thái</label><select name="status">${opts(PRODUCT_STATUS)}</select></div><div class="field"><label>Link sản phẩm</label><input name="link" type="url" placeholder="https://..."></div><div class="field wide"><label>Ghi chú</label><textarea name="note"></textarea></div></div>${close}</form>`;
 }
 if(ui.modal==='outcome'){
  title='Nhập Ads & Kết quả'; body=`<form id="outcomeForm"><div class="form-grid"><div class="field"><label>Ngày ghi nhận</label><input name="date" type="date" value="${today()}" required></div><div class="field"><label>Sản phẩm</label><select name="productId" required>${data.products.map(p=>`<option value="${p.id}">${esc(p.id)} — ${esc(p.title)}</option>`).join('')}</select></div><div class="field"><label>Nền tảng</label><select name="platform">${opts(['Facebook Ads','TikTok Ads','Organic','Khác'])}</select></div><div class="field"><label>Khu vực</label><select name="area">${opts(AREAS)}</select></div><div class="field"><label>Ngân sách</label><input name="budget" type="number" value="0" min="0" required></div><div class="field"><label>Lượt tiếp cận</label><input name="reach" type="number" value="0" min="0"></div><div class="field"><label>Lượt xem</label><input name="views" type="number" value="0" min="0"></div><div class="field"><label>Tương tác</label><input name="engagement" type="number" value="0" min="0"></div><div class="field"><label>Tin nhắn</label><input name="messages" type="number" value="0" min="0" required></div><div class="field"><label>Lead có thông tin</label><input name="leads" type="number" value="0" min="0" required></div><div class="field"><label>Hồ sơ đăng ký</label><input name="enrollments" type="number" value="0" min="0" required></div><div class="field"><label>Đánh giá</label><select name="rating"><option>Tốt</option><option>Đạt</option><option>Chưa tốt</option><option>Dừng</option></select></div><div class="field wide"><label>Ghi chú kết quả</label><textarea name="note"></textarea></div></div>${close}</form>`;
 }
 if(ui.modal==='other'){
  title='Báo cáo công việc khác'; body=`<form id="otherForm"><div class="form-grid"><div class="field"><label>Ngày thực hiện</label><input name="date" type="date" value="${today()}" required></div><div class="field"><label>Nhóm phát sinh</label><select name="group">${opts(OTHER_GROUPS)}</select></div><div class="field wide"><label>Tên công việc</label><input name="title" required></div><div class="field wide"><label>Lý do phát sinh</label><input name="reason" required></div><div class="field"><label>Người yêu cầu</label><select name="requester"><option>Quản lý</option><option>Sale</option><option>Cơ sở</option><option>Tự đề xuất</option></select></div><div class="field"><label>Thời gian thực hiện (giờ)</label><input name="hours" type="number" min="0.5" step="0.5" required></div><div class="field wide"><label>Kết quả bàn giao</label><input name="result" required></div><div class="field"><label>Link minh chứng</label><input name="proof" type="url" placeholder="https://..."></div><div class="field"><label>Giá trị đóng góp</label><select name="value"><option>Nội dung</option><option>Vận hành</option><option>Kỹ thuật</option><option>Lead</option><option>Hỗ trợ</option></select></div><div class="field"><label>Mức độ</label><select name="level"><option>Nhỏ</option><option>Trung bình</option><option>Quan trọng</option><option>Đặc biệt</option></select></div></div>${close}</form>`;
 }
 if(ui.modal?.startsWith('member:')){
  const u=member(ui.modal.split(':')[1]); title='Chỉnh thông tin nhân sự'; body=`<form id="memberForm"><input type="hidden" name="id" value="${esc(u.id)}"><div class="form-grid"><div class="field"><label>Mã nhân sự</label><input value="${esc(u.id)}" disabled></div><div class="field"><label>Họ tên</label><input name="name" value="${esc(u.name)}" required></div><div class="field"><label>Vai trò</label><select name="role">${Object.entries(ROLE_LABEL).filter(([key])=>key!=='ADMIN').map(([key,val])=>`<option value="${key}"${selected(key,u.role)}>${val}</option>`).join('')}</select></div><div class="field"><label>Trạng thái</label><select name="active"><option value="true"${u.active?' selected':''}>Hoạt động</option><option value="false"${!u.active?' selected':''}>Tạm ngưng</option></select></div><div class="field wide"><label>KPI mô tả</label><input name="kpi" value="${esc(u.kpi||'')}"></div></div>${close}</form>`;
 }
 return `<div class="modal-backdrop" data-close><div class="modal" onclick="event.stopPropagation()"><h3>${title}</h3>${body}</div></div>`;
}
function productCode(area,type,owner){ const a={'Phan Thiết':'PT','La Gi':'LG','Bắc Bình':'BB','Toàn tỉnh':'ALL'}[area]||'ALL'; const t=type.includes('Poster')?'POSTER':type.includes('Live')?'LIVE':type.includes('Bài')?'POST':'VIDEO'; const o=owner.replace('MEDIA-','M').replace('TALENT-','T').replace('IT-','IT'); return `${a}-${t}-${o}-${String(data.products.length+1).padStart(3,'0')}`; }
function csvDownload(name, rows){ const csv='\uFEFF'+rows.map(r=>r.map(v=>`"${String(v??'').replaceAll('"','""')}"`).join(',')).join('\n'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); a.download=name; a.click(); }
function exportKpi(){ const rows=[['Thành viên','Vai trò','Chủ đề','Sản phẩm','Đã đăng','Lead','Hồ sơ','Điểm công việc khác','Điểm KPI']]; data.users.filter(u=>u.role!=='ADMIN').forEach(u=>{const s=memberStats(u);rows.push([u.name,ROLE_LABEL[u.role],s.topics,s.products,s.posted,s.leads,s.enrollments,s.other,s.score]);});csvDownload('bao-cao-kpi-marketing.csv',rows); }
function exportProducts(){ const rows=[['Mã','Tên sản phẩm','Người thực hiện','Talent','Khu vực','Mục tiêu','Nền tảng','Trạng thái','Lead','Hồ sơ','Link']]; data.products.filter(p=>matchFilters(p,'workDate')).forEach(p=>{const m=productOutcome(p.id);rows.push([p.id,p.title,nameOf(p.owner),nameOf(p.talent),p.area,p.goal,p.platform,p.status,m.leads,m.enrollments,p.link]);});csvDownload('san-pham-va-ket-qua.csv',rows); }

async function logIn(form){
 const f=Object.fromEntries(new FormData(form).entries());
 if(ONLINE){
  const {data:auth,error}=await cloud.auth.signInWithPassword({email:f.email,password:f.password}); if(error) throw error;
  const {data:profile,error:pe}=await cloud.from('members').select('record').eq('auth_user_id',auth.user.id).single(); if(pe||!profile) throw new Error('Tài khoản chưa được gắn nhân sự.'); me=profile.record;
  await cloudLoad();
 } else { const u=data.users.find(x=>x.id===f.userId && x.password===f.password); if(!u) throw new Error('Sai tài khoản hoặc mật khẩu.'); me=u; }
 sessionStorage.setItem(SESSION_KEY,JSON.stringify(me)); ui.page='dashboard';
}
async function bind(){
 const login=document.getElementById('loginForm'); if(login) login.onsubmit=async e=>{e.preventDefault();try{await logIn(e.target);render();}catch(err){toast(err.message||'Không đăng nhập được.');}};
 document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{ui.page=b.dataset.nav;ui.modal=null;ui.quick=false;render();});
 document.getElementById('logout')?.addEventListener('click',async()=>{if(ONLINE) await cloud.auth.signOut(); me=null;sessionStorage.removeItem(SESSION_KEY);render();});
 document.getElementById('quickBtn')?.addEventListener('click',()=>{ui.quick=!ui.quick;render();});
 document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{ui.modal=b.dataset.open;ui.quick=false;render();});
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>{ui.modal=null;render();});
 ['period','filterArea','filterMember','filterGoal','filterPlatform'].forEach(id=>document.getElementById(id)?.addEventListener('change',e=>{ const map={period:'period',filterArea:'area',filterMember:'member',filterGoal:'goal',filterPlatform:'platform'}; ui[map[id]]=e.target.value;render(); }));
 document.querySelector('[data-reset-filter]')?.addEventListener('click',()=>{ui.period='month';ui.area='all';ui.member='all';ui.goal='all';ui.platform='all';render();});
 document.querySelectorAll('[data-approve]').forEach(b=>b.onclick=async()=>{const x=data.otherWorks.find(w=>w.id===b.dataset.approve);x.status='Đã duyệt';await persist('otherWorks',x);toast('Đã duyệt và cộng điểm công việc khác.');render();});
 document.querySelectorAll('[data-reject]').forEach(b=>b.onclick=async()=>{const x=data.otherWorks.find(w=>w.id===b.dataset.reject);x.status='Không tính';await persist('otherWorks',x);toast('Đã ghi nhận không tính KPI.');render();});
 document.querySelectorAll('[data-edit-member]').forEach(b=>b.onclick=()=>{ui.modal='member:'+b.dataset.editMember;render();});
 document.querySelector('[data-export="kpi"]')?.addEventListener('click',exportKpi); document.querySelector('[data-export="products"]')?.addEventListener('click',exportProducts);
 const daily=document.getElementById('dailyForm'); if(daily) daily.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());await persist('dailyReports',{id:uid('DR'),userId:me.id,...f,hours:n(f.hours)});ui.modal=null;toast('Đã lưu báo cáo hôm nay.');render();};
 const topic=document.getElementById('topicForm'); if(topic) topic.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());await persist('topics',{id:uid('CT'),author:me.id,...f});ui.modal=null;toast('Đã lưu chủ đề nghiên cứu.');render();};
 const product=document.getElementById('productForm'); if(product) product.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries()); const record={id:productCode(f.area,f.type,f.owner),partners:f.talent?[f.talent]:[],...f}; await persist('products',record); if(f.topicId){const t=data.topics.find(x=>x.id===f.topicId); if(t){t.status='Đã thực hiện'; await persist('topics',t);}} ui.modal=null;toast('Đã lưu sản phẩm thực hiện.');render();};
 const outcome=document.getElementById('outcomeForm'); if(outcome) outcome.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());['budget','reach','views','engagement','messages','leads','enrollments'].forEach(k=>f[k]=n(f[k]));await persist('outcomes',{id:uid('RS'),...f});const p=data.products.find(x=>x.id===f.productId);if(p&&f.platform.includes('Ads')){p.status='Đang chạy Ads';await persist('products',p);}ui.modal=null;toast('Đã lưu kết quả nội dung.');render();};
 const other=document.getElementById('otherForm'); if(other) other.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());await persist('otherWorks',{id:uid('OW'),userId:me.id,...f,hours:n(f.hours),points:OTHER_LEVEL_POINTS[f.level],status:'Chờ duyệt',comment:''});ui.modal=null;toast('Đã gửi công việc khác chờ duyệt.');render();};
 const mf=document.getElementById('memberForm'); if(mf) mf.onsubmit=async e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target).entries());const u=member(f.id);u.name=f.name;u.role=f.role;u.active=f.active==='true';u.kpi=f.kpi;await persist('users',u);if(me.id===u.id){me=u;sessionStorage.setItem(SESSION_KEY,JSON.stringify(me));}ui.modal=null;toast('Đã cập nhật nhân sự.');render();};
}
async function bootstrap(){
 if(ONLINE){ const {data:s}=await cloud.auth.getSession(); if(s.session){ const {data:p}=await cloud.from('members').select('record').eq('auth_user_id',s.session.user.id).maybeSingle(); if(p?.record){me=p.record;sessionStorage.setItem(SESSION_KEY,JSON.stringify(me));await cloudLoad();} } }
 render();
}
function render(){ root.innerHTML=me?shell(mainView()):loginView(); bind(); }
bootstrap();
