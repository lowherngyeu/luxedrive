const I=window.LuxeInventory,h=I.escape;
let inventoryState=I.read(),vehicles=inventoryState.cars;
const money=value=>new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(value);
const whatsapp=car=>'https://wa.me/'+(car.branch==='Setia Alam'?'60123878655':'601165699836')+'?text='+encodeURIComponent(`Hello LuxeDrive, I'm interested in the ${car.year} ${car.name}, listed at ${money(car.price)}. Could you confirm availability and arrange a viewing?`);
const category=['Unregistered','Consignment'].includes(document.body.dataset.category)?document.body.dataset.category:'All';
const grid=document.querySelector('#vehicles');
function render(){
 const query=document.querySelector('#search').value.trim().toLowerCase(),sort=document.querySelector('#sort').value;
 const shown=vehicles.filter(v=>['Available','Incoming','Reserved'].includes(v.status)&&(category==='All'||v.category===category)&&`${v.brand} ${v.name} ${v.year}`.toLowerCase().includes(query));
 if(sort==='price-up')shown.sort((a,b)=>a.price-b.price);if(sort==='price-down')shown.sort((a,b)=>b.price-a.price);if(sort==='year')shown.sort((a,b)=>b.year-a.year);
 grid.innerHTML=shown.map(v=>`<article class="vehicle-card"><button class="detail-button" data-id="${h(v.id)}" aria-label="View details for ${v.year} ${h(v.name)}"><div class="vehicle-photo"><img src="${h(v.image)}" alt="${v.year} ${h(v.name)} at LuxeDrive" loading="lazy" width="600" height="420"><span class="photo-count">${v.images.length} photo${v.images.length===1?'':'s'}</span><span class="badge">${h(v.status!=='Available'?v.status.toUpperCase():v.category.toUpperCase())}</span></div><div class="vehicle-info"><p class="meta">${v.year} · ${h(v.brand)}</p><h3>${h(v.name)}</h3><p class="specs">${h(v.engine)} &nbsp;·&nbsp; ${h(v.mileage)}</p></div></button><div class="vehicle-bottom"><span>${money(v.price)}</span><a href="${whatsapp(v)}" target="_blank" rel="noopener" aria-label="Enquire about ${h(v.name)} on WhatsApp">Enquire <span>↗</span></a></div></article>`).join('');
 document.querySelector('#result-count').textContent=`${shown.length} selected vehicle${shown.length===1?'':'s'}`;document.querySelector('#empty').hidden=shown.length>0;
 let banner=document.querySelector('#local-preview-banner');if(inventoryState.custom){if(!banner){banner=document.createElement('div');banner.id='local-preview-banner';banner.className='preview-banner';document.body.prepend(banner);}banner.innerHTML='LOCAL INVENTORY PREVIEW · Changes shown only in this browser. <a href="admin/">Manage inventory ↗</a>';}else banner?.remove();
}

document.querySelector('#search').addEventListener('input',render);document.querySelector('#sort').addEventListener('change',render);
document.querySelector('#reset').addEventListener('click',()=>{document.querySelector('#search').value='';document.querySelector('#sort').value='featured';render();});
const dialog=document.querySelector('#vehicle-dialog');
let activeGallery=null,activePhoto=0;
function galleryMarkup(v){activeGallery=v;activePhoto=Math.max(0,v.images.indexOf(v.image));return `<div class="detail-gallery"><img id="gallery-main" src="${h(v.image)}" alt="${h(v.name)} — photo ${activePhoto+1}"><div class="gallery-footer"><span id="gallery-counter" aria-live="polite">Photo ${activePhoto+1} of ${v.images.length}</span>${v.images.length>1?'<span>Select a photo below</span>':''}</div><div class="gallery-thumbnails" aria-label="Vehicle photo gallery">${v.images.map((src,index)=>`<button type="button" data-gallery-photo="${index}" aria-label="View photo ${index+1}" aria-pressed="${index===activePhoto}"><img src="${h(src)}" alt="" loading="lazy"></button>`).join('')}</div></div>`;}
dialog.addEventListener('click',event=>{const button=event.target.closest('[data-gallery-photo]');if(!button||!activeGallery)return;activePhoto=Number(button.dataset.galleryPhoto);const image=document.querySelector('#gallery-main');image.src=activeGallery.images[activePhoto];image.alt=activeGallery.name+' — photo '+(activePhoto+1);document.querySelector('#gallery-counter').textContent='Photo '+(activePhoto+1)+' of '+activeGallery.images.length;dialog.querySelectorAll('[data-gallery-photo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.galleryPhoto)===activePhoto)));});
dialog.addEventListener('close',()=>{activeGallery=null;});
grid.addEventListener('click',event=>{const button=event.target.closest('[data-id]');if(!button)return;const v=vehicles.find(c=>c.id===button.dataset.id);if(!v)return;
 document.querySelector('#detail-content').innerHTML=`<div class="detail-layout">${galleryMarkup(v)}<div class="detail-copy"><p class="eyebrow">${h(v.category.toUpperCase())} · ${v.year}</p><h2 id="detail-title">${h(v.name)}</h2><p class="price">${money(v.price)}</p><dl><dt>Engine</dt><dd>${h(v.engine)}</dd><dt>Mileage</dt><dd>${h(v.mileage)}</dd><dt>Transmission</dt><dd>${h(v.transmission)}</dd><dt>Body style</dt><dd>${h(v.body)}</dd><dt>Outlet</dt><dd>${h(v.branch)}</dd><dt>Status</dt><dd>${h(v.status)}</dd></dl><p>${h(v.note||'Confirm current availability, vehicle specification and condition with our team before making a decision.')}</p><a class="button gold" href="${whatsapp(v)}" target="_blank" rel="noopener">Enquire on WhatsApp ↗</a><br><button type="button" class="button outline pdf-button" data-pdf-id="${h(v.id)}">Download vehicle PDF ↓</button></div></div>`;dialog.showModal(); I.photos(v).then(images=>{if(!dialog.open||activeGallery?.id!==v.id)return;const selected=activePhoto;dialog.querySelector(".detail-gallery").outerHTML=galleryMarkup({...v,images,image:images[selected]});});
});
window.addEventListener('storage',event=>{if(event.key===I.KEY){inventoryState=I.read();vehicles=inventoryState.cars;if(dialog.open)dialog.close();render();}});
document.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
const menu=document.querySelector('.menu');
const collectionDropdown=document.querySelector('#collection-dropdown');
document.addEventListener('click',event=>{if(collectionDropdown?.open&&!collectionDropdown.contains(event.target))collectionDropdown.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&collectionDropdown?.open){collectionDropdown.open=false;collectionDropdown.querySelector('summary').focus();}});
collectionDropdown?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{collectionDropdown.open=false;}));

menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));document.querySelector('#navigation').classList.toggle('open',open);if(!open&&collectionDropdown)collectionDropdown.open=false;});
document.querySelectorAll('#navigation a').forEach(link=>link.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');document.querySelector('#navigation').classList.remove('open');}));
function calculate(){
  const form=document.querySelector('#finance-form');if(!form)return;
  if(!form.checkValidity()){document.querySelector('#monthly').textContent='Check your inputs';document.querySelector('#finance-summary').textContent='Enter values within the indicated ranges.';return;}
  const price=Number(document.querySelector('#price').value),deposit=Number(document.querySelector('#deposit').value),years=Number(document.querySelector('#years').value),rate=Number(document.querySelector('#rate').value);
  const principal=price*(1-deposit/100),interest=principal*rate/100*years;
  document.querySelector('#monthly').textContent=money((principal+interest)/(years*12))+' / mo';
  document.querySelector('#finance-summary').textContent=`${money(principal)} financed · ${years*12} months · ${money(interest)} illustrative interest`;
}
document.querySelector('#finance-form')?.addEventListener('input',calculate);
document.querySelector('#finance-form')?.addEventListener('change',calculate);
document.querySelector('#finance-form')?.addEventListener('submit',event=>event.preventDefault());
render();calculate();
