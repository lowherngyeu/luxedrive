const vehicles = [
  {id:'6612744',name:'Porsche 718 Cayman',brand:'Porsche',year:2022,price:385000,category:'Unregistered',image:'cayman.webp',engine:'2.0L petrol',mileage:'25,509 km',transmission:'Automatic',body:'Coupe'},
  {id:'6602647',name:'BMW M4 Competition',brand:'BMW',year:2021,price:418000,category:'Unregistered',image:'m4.webp',engine:'3.0L petrol',mileage:'Enquire for mileage',transmission:'Automatic',body:'Coupe',note:'Rear-wheel drive. Confirm current mileage and inspection documentation with the team.'},
  {id:'6615856',name:'BMW 420i Gran Coupe',brand:'BMW',year:2023,price:230000,category:'Unregistered',image:'420i.webp',engine:'2.0L petrol',mileage:'12,000 km',transmission:'Automatic',body:'Gran Coupe',note:'M Sport. The original listing title and description state 2023, but one specification field states 2021. Confirm model year with the team.'},
  {id:'6745498',name:'Toyota Voxy SZ',brand:'Toyota',year:2022,price:156000,category:'Unregistered',image:'voxy.webp',engine:'Enquire for specifications',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'MPV'},
  {id:'6666822',name:'Porsche Cayman 2.0',brand:'Porsche',year:2019,price:285000,category:'Consignment',image:'cayman-used.webp',engine:'2.0L',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'Coupe'},
  {id:'6617569',name:'Lamborghini Huracan LP610-4',brand:'Lamborghini',year:2015,price:760000,category:'Consignment',image:'huracan.webp',engine:'Enquire for specifications',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'Coupe'}
];
const money = value => new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(value);
const whatsapp = car => 'https://wa.me/601165699836?text='+encodeURIComponent(`Hello LuxeDrive, I'm interested in the ${car.year} ${car.name}, listed at ${money(car.price)}. Could you confirm availability and arrange a viewing?`);
const source = car => car.source || `https://www.luxedrive.com.my/showproducts/productid/${car.id}/`;
let category = 'All';
const grid = document.querySelector('#vehicles');
function render(){
  const query = document.querySelector('#search').value.trim().toLowerCase();
  const sort = document.querySelector('#sort').value;
  const shown = vehicles.filter(v=>(category==='All'||v.category===category)&&`${v.brand} ${v.name} ${v.year}`.toLowerCase().includes(query));
  if(sort==='price-up') shown.sort((a,b)=>a.price-b.price);
  if(sort==='price-down') shown.sort((a,b)=>b.price-a.price);
  if(sort==='year') shown.sort((a,b)=>b.year-a.year);
  grid.innerHTML = shown.map(v=>`<article class="vehicle-card"><button class="detail-button" data-id="${v.id}" aria-label="View details for ${v.year} ${v.name}"><div class="vehicle-photo"><img src="${v.image}" alt="${v.year} ${v.name} at LuxeDrive" loading="lazy" width="600" height="420"><span class="badge">${v.category.toUpperCase()}</span></div><div class="vehicle-info"><p class="meta">${v.year} · ${v.brand}</p><h3>${v.name}</h3><p class="specs">${v.engine} &nbsp;·&nbsp; ${v.mileage}</p></div></button><div class="vehicle-bottom"><span>${money(v.price)}</span><a href="${whatsapp(v)}" target="_blank" rel="noopener" aria-label="Enquire about ${v.name} on WhatsApp">Enquire <span>↗</span></a></div></article>`).join('');
  document.querySelector('#result-count').textContent=`${shown.length} selected vehicle${shown.length===1?'':'s'}`;
  document.querySelector('#empty').hidden=shown.length>0;
}
document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>{
  category=button.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});render();
}));
document.querySelector('#search').addEventListener('input',render);
document.querySelector('#sort').addEventListener('change',render);
document.querySelector('#reset').addEventListener('click',()=>{document.querySelector('#search').value='';document.querySelector('#sort').value='featured';document.querySelector('[data-category="All"]').click();});
const dialog=document.querySelector('#vehicle-dialog');
grid.addEventListener('click',event=>{
  const button=event.target.closest('[data-id]');if(!button)return;
  const v=vehicles.find(car=>car.id===button.dataset.id);
  document.querySelector('#detail-content').innerHTML=`<div class="detail-layout"><img src="${v.image}" alt="${v.name}"><div class="detail-copy"><p class="eyebrow">${v.category.toUpperCase()} · ${v.year}</p><h2 id="detail-title">${v.name}</h2><p class="price">${money(v.price)}</p><dl><dt>Engine</dt><dd>${v.engine}</dd><dt>Mileage</dt><dd>${v.mileage}</dd><dt>Transmission</dt><dd>${v.transmission}</dd><dt>Body style</dt><dd>${v.body}</dd></dl><p>${v.note||'Confirm current availability, vehicle specification and condition with our team before making a decision.'}</p><a class="button gold" href="${whatsapp(v)}" target="_blank" rel="noopener">Enquire on WhatsApp ↗</a><br><a class="text-link" href="${source(v)}" target="_blank" rel="noopener">Original listing ↗</a></div></div>`;
  dialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const menu=document.querySelector('.menu');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#navigation').classList.toggle('open',open);});
document.querySelectorAll('#navigation a').forEach(link=>link.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#navigation').classList.remove('open');}));
function calculate(){
  const form=document.querySelector('#finance-form');
  if(!form.checkValidity()){document.querySelector('#monthly').textContent='Check your inputs';document.querySelector('#finance-summary').textContent='Enter values within the indicated ranges.';return;}
  const price=Number(document.querySelector('#price').value),deposit=Number(document.querySelector('#deposit').value),years=Number(document.querySelector('#years').value),rate=Number(document.querySelector('#rate').value);
  const principal=price*(1-deposit/100),interest=principal*rate/100*years;
  document.querySelector('#monthly').textContent=money((principal+interest)/(years*12))+' / mo';
  document.querySelector('#finance-summary').textContent=`${money(principal)} financed · ${years*12} months · ${money(interest)} illustrative interest`;
}
document.querySelector('#finance-form').addEventListener('input',calculate);
document.querySelector('#finance-form').addEventListener('change',calculate);
document.querySelector('#finance-form').addEventListener('submit',event=>event.preventDefault());
render();calculate();
