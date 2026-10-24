(function(){
  'use strict';
  const I=window.LuxeInventory,$=s=>document.querySelector(s),h=I.escape;
  if(!I.PREVIEW_MODE){$('#preview-notice').hidden=true;$('#workspace').hidden=true;$('#locked').hidden=false;return;}
  let state=I.read(),cars=state.cars,currentImage='',currentPhotos=[],photoBusy=false,confirmAction=null,dirty=false;
  const money=value=>new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(value);
  function message(text){$('#admin-message').textContent=text;}
  function render(){
    const query=$('#admin-search').value.trim().toLowerCase(),status=$('#status-filter').value,branch=$('#branch-filter').value;
    const shown=cars.filter(c=>(status==='All'||c.status===status)&&(branch==='All'||c.branch===branch)&&`${c.name} ${c.brand} ${c.year}`.toLowerCase().includes(query));
    $('#stats').innerHTML=[['Total vehicles',cars.length],['Available',cars.filter(c=>c.status==='Available').length],['Reserved',cars.filter(c=>c.status==='Reserved').length],['Sold / draft',cars.filter(c=>['Sold','Draft'].includes(c.status)).length]].map(([label,n])=>`<div><span>${label}</span><strong>${n}</strong></div>`).join('');
    $('#admin-list').innerHTML=shown.map(c=>`<article class="admin-car"><img src="${h(c.image)}" alt="${h(c.name)}" loading="lazy"><div><p>${c.year} · ${h(c.brand)} · ${h(c.category)}</p><h2>${h(c.name)}</h2><span class="status-pill ${c.status.toLowerCase()}">${h(c.status)}</span></div><div class="price-cell"><p class="car-price">${money(c.price)}</p></div><div class="outlet-cell"><p>${h(c.branch)}</p></div><div class="car-actions"><button data-edit="${h(c.id)}" aria-label="Edit ${h(c.name)}">Edit</button><button class="delete" data-delete="${h(c.id)}" aria-label="Delete ${h(c.name)}">Delete</button></div></article>`).join('');
    $('#admin-count').textContent=`${shown.length} of ${cars.length} vehicle${cars.length===1?'':'s'}`;$('#admin-empty').hidden=shown.length>0;
  }
  function persist(next,notice){cars=I.write(next);render();message(notice);}
  const fields=['name','brand','year','price','category','status','branch','engine','mileage','transmission','body','source','note'];
  function showPhoto(){
    if(!currentPhotos.includes(currentImage))currentImage=currentPhotos[0]||'';
    const image=$('#photo-preview');image.hidden=!currentImage;$('#photo-placeholder').hidden=!!currentImage;if(currentImage)image.src=currentImage;else image.removeAttribute('src');
    $('#photo-count').textContent=currentPhotos.length+' / 12 photos · Main photo appears on the listing card.';
    $('#photo-gallery').innerHTML=currentPhotos.map((src,index)=>`<div class="photo-tile"><img src="${h(src)}" alt="Vehicle photo ${index+1}"><button type="button" class="main-photo-button" data-main="${index}" aria-pressed="${src===currentImage}" aria-label="Set photo ${index+1} as main">${src===currentImage?'★ Main photo':'Set as main'}</button><button type="button" class="remove-photo-button" data-remove-photo="${index}" aria-label="Remove photo ${index+1}">×</button></div>`).join('');
  }
  function addPhoto(src){if(currentPhotos.includes(src))return false;if(currentPhotos.length>=12)throw new Error('Each vehicle can have up to 12 photos. Remove a photo to add another.');currentPhotos.push(src);if(!currentImage)currentImage=src;dirty=true;return true;}
  $('#photo-gallery').addEventListener('click',event=>{if(photoBusy)return;const main=event.target.closest('[data-main]'),remove=event.target.closest('[data-remove-photo]');if(main){currentImage=currentPhotos[Number(main.dataset.main)];dirty=true;showPhoto();}else if(remove){currentPhotos.splice(Number(remove.dataset.removePhoto),1);dirty=true;showPhoto();}});
  $('#add-photo-url').addEventListener('click',()=>{if(photoBusy)return;const src=I.safeImage($('#image-url').value.trim());if(!src||!src.startsWith('https:')){$('#photo-status').textContent='Enter a valid HTTPS photo URL.';return;}try{const added=addPhoto(src);showPhoto();$('#image-url').value='';$('#photo-status').textContent=added?'Photo added. Choose its main-photo button if you want it on the listing card.':'This photo is already in the gallery.';}catch(error){$('#photo-status').textContent=error.message;}});

  function edit(id){
    const c=id?cars.find(car=>car.id===id):null;if(id&&!c)return;
    $('#car-form').reset();$('#form-error').textContent='';$('#photo-status').textContent='';$('#car-id').value=c?.id||'';$('#editor-title').textContent=c?'Edit vehicle':'Add vehicle';
    $('#car-year').max=new Date().getFullYear()+2;
    fields.forEach(key=>{const input=$('#car-'+key);if(c)input.value=c[key]??'';else if(key==='year')input.value=new Date().getFullYear();});
    currentPhotos=c?[...c.images]:[];currentImage=c?.image||'';$('#image-url').value='';showPhoto();dirty=false;photoBusy=false;$('#save-car').disabled=false;$('#editor').showModal();
  }
  function ask(title,text,action){$('#confirm-title').textContent=title;$('#confirm-text').textContent=text;confirmAction=action;$('#confirm-dialog').showModal();}
  function closeEditor(){if(photoBusy){$('#photo-status').textContent='Please wait for photos to finish processing.';return;}if(dirty){ask('Discard these changes?','Unsaved vehicle details will be discarded.',()=>{$('#editor').close();dirty=false;});}else $('#editor').close();}
  $('#add-car').addEventListener('click',()=>edit());$('#cancel-edit').addEventListener('click',closeEditor);$('.dialog-close').addEventListener('click',closeEditor);
  $('#editor').addEventListener('cancel',event=>{if(dirty||photoBusy){event.preventDefault();closeEditor();}});
  $('#car-form').addEventListener('input',()=>{dirty=true;});
  $('#photo-preview').addEventListener('error',()=>{$('#photo-status').textContent='Photo could not be loaded. Check the URL or upload a photo.';});
  $('#photo-file').addEventListener('change',async()=>{
    const files=Array.from($('#photo-file').files);$('#photo-file').value='';if(!files.length||photoBusy)return;
    if(currentPhotos.length+files.length>12){$('#photo-status').textContent='A vehicle can have up to 12 photos. Select fewer files or remove existing photos.';return;}
    photoBusy=true;$('#save-car').disabled=true;$('#photo-file').disabled=true;$('#add-photo-url').disabled=true;let added=0,failed=0;
    try{for(const file of files){let bitmap;$('#photo-status').textContent='Preparing photo '+(added+failed+1)+' of '+files.length+'…';
      try{if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024)throw new Error('Invalid photo');
        bitmap=await createImageBitmap(file);const scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#171a14';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);if(addPhoto(canvas.toDataURL('image/jpeg',.72)))added++;
      }catch{failed++;}finally{bitmap?.close();}
    }showPhoto();$('#photo-status').textContent=added+' photo(s) added.'+(failed?' '+failed+' file(s) could not be read; use JPEG, PNG or WebP under 10 MB.':' Choose a main photo, then save the vehicle.');
    }finally{photoBusy=false;$('#save-car').disabled=false;$('#photo-file').disabled=false;$('#add-photo-url').disabled=false;}
  });
  $('#car-form').addEventListener('submit',event=>{
    event.preventDefault();if(photoBusy)return;$('#form-error').textContent='';
    try{const id=$('#car-id').value;if($('#image-url').value.trim())throw new Error('Click Add URL photo to include the photo link, or clear the link field before saving.');const data={id:id||crypto.randomUUID(),image:currentImage,images:currentPhotos};fields.forEach(key=>data[key]=$('#car-'+key).value);const car=I.clean(data);let next;
      if(id){if(!cars.some(c=>c.id===id))throw new Error('This listing was deleted in another tab. Close the editor and reload.');next=cars.map(c=>c.id===id?car:c);}else next=[car,...cars];
      persist(next,`${car.name} ${id?'updated':'added'} in this browser’s preview.`);dirty=false;$('#editor').close();
    }catch(error){$('#form-error').textContent=error.message;}
  });
  $('#admin-list').addEventListener('click',event=>{const editButton=event.target.closest('[data-edit]');if(editButton)return edit(editButton.dataset.edit);const del=event.target.closest('[data-delete]');if(!del)return;const car=cars.find(c=>c.id===del.dataset.delete);if(!car)return;ask('Delete this vehicle?',`${car.name} will be removed from this browser’s preview. Export a backup first if you want to restore it later.`,()=>persist(cars.filter(c=>c.id!==car.id),`${car.name} deleted from this browser’s preview.`));});
  $('#confirm-cancel').addEventListener('click',()=>{$('#confirm-dialog').close();confirmAction=null;});
  $('#confirm-dialog').addEventListener('cancel',()=>{confirmAction=null;});
  $('#confirm-ok').addEventListener('click',()=>{const action=confirmAction;confirmAction=null;$('#confirm-dialog').close();try{action?.();}catch(error){message(error.message);}});
  for(const selector of ['#admin-search','#status-filter','#branch-filter'])$(selector).addEventListener(selector==='#admin-search'?'input':'change',render);
  $('#clear-filters').addEventListener('click',()=>{$('#admin-search').value='';$('#status-filter').value='All';$('#branch-filter').value='All';render();});
  $('#export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),cars},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`luxedrive-inventory-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Inventory backup downloaded. Keep it to restore this preview on another browser.');});
  $('#import').addEventListener('click',()=>$('#import-file').click());
  $('#import-file').addEventListener('change',async()=>{const file=$('#import-file').files[0];$('#import-file').value='';if(!file)return;try{if(file.size>8*1024*1024)throw new Error('Backup must be under 8 MB.');const data=JSON.parse(await file.text());if(data.version!==1||!Array.isArray(data.cars)||data.cars.length>500)throw new Error('Choose a valid LuxeDrive inventory backup.');const checked=data.cars.map(I.clean);if(new Set(checked.map(c=>c.id)).size!==checked.length)throw new Error('Backup contains duplicate vehicle IDs.');ask('Replace preview inventory?',`Import ${checked.length} vehicles and replace this browser’s current inventory. Export your current backup first if needed.`,()=>persist(checked,'Inventory backup imported into this browser’s preview.'));}catch(error){message(error instanceof SyntaxError?'This file is not valid JSON.':error.message);}});
  $('#reset-inventory').addEventListener('click',()=>ask('Restore original inventory?','This removes all local preview changes and restores the original six vehicles. Export a backup first if needed.',()=>{I.reset();cars=I.read().cars;render();message('Original preview inventory restored.');}));
  window.addEventListener('storage',event=>{if(event.key!==I.KEY)return;cars=I.read().cars;render();message('Inventory changed in another tab. Reload any open editor before saving.');if($('#editor').open){dirty=false;$('#editor').close();}});
  window.addEventListener('beforeunload',event=>{if(dirty&&$('#editor').open){event.preventDefault();event.returnValue='';}});
  render();if(state.error)message(state.error);
})();
