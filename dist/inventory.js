/* Preview mode is deliberately browser-local. Production requires server-enforced authentication. */
(function () {
  'use strict';
  const PREVIEW_MODE = true;
  const KEY = 'luxedrive.inventory.preview.v1';
const defaults = [
  {id:'6612744',name:'Porsche 718 Cayman',brand:'Porsche',year:2022,price:385000,category:'Unregistered',image:'cayman.webp',engine:'2.0L petrol',mileage:'25,509 km',transmission:'Automatic',body:'Coupe'},
  {id:'6602647',name:'BMW M4 Competition',brand:'BMW',year:2021,price:418000,category:'Unregistered',image:'m4.webp',engine:'3.0L petrol',mileage:'Enquire for mileage',transmission:'Automatic',body:'Coupe',note:'Rear-wheel drive. Confirm current mileage and inspection documentation with the team.'},
  {id:'6615856',name:'BMW 420i Gran Coupe',brand:'BMW',year:2023,price:230000,category:'Unregistered',image:'420i.webp',engine:'2.0L petrol',mileage:'12,000 km',transmission:'Automatic',body:'Gran Coupe',note:'M Sport. The original listing title and description state 2023, but one specification field states 2021. Confirm model year with the team.'},
  {id:'6745498',name:'Toyota Voxy SZ',brand:'Toyota',year:2022,price:156000,category:'Unregistered',image:'voxy.webp',engine:'Enquire for specifications',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'MPV'},
  {id:'6666822',name:'Porsche Cayman 2.0',brand:'Porsche',year:2019,price:285000,category:'Consignment',image:'cayman-used.webp',engine:'2.0L',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'Coupe'},
  {id:'6617569',name:'Lamborghini Huracan LP610-4',brand:'Lamborghini',year:2015,price:760000,category:'Consignment',image:'huracan.webp',engine:'Enquire for specifications',mileage:'Enquire for mileage',transmission:'Confirm with team',body:'Coupe'}
];
  const statuses = ['Available', 'Reserved', 'Sold', 'Draft'];
  const categories = ['Unregistered', 'Consignment'];
  const branches = ['Bukit Jalil', 'Setia Alam'];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeImage(value) {
    if(typeof value !== 'string') return '';
    if(/^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(value)) return value;
    if(/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/i.test(value)) return value;
    try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
  }
  function safeSource(value) {
    if(!value) return '';
    try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; }
  }
  function clean(input) {
    if(!input || typeof input !== 'object') throw new Error('Invalid vehicle data.');
    const text = (key,max=180) => String(input[key] ?? '').trim().slice(0,max);
    const year=Number(input.year), price=Number(input.price);
    if(!text('name') || !text('brand')) throw new Error('Vehicle name and make are required.');
    if(!Number.isInteger(year) || year<1900 || year>new Date().getFullYear()+2) throw new Error('Enter a valid vehicle year.');
    if(input.price==='' || input.price==null || !Number.isFinite(price) || price<=0 || price>100000000) throw new Error('Enter a price greater than RM0 and no more than RM100,000,000.');
    if(!categories.includes(input.category)) throw new Error('Choose a valid category.');
    const supplied=Array.isArray(input.images)?input.images:[input.image];
    if(supplied.length<1 || supplied.length>12) throw new Error('Add between 1 and 12 vehicle photos.');
    const images=[...new Set(supplied.map(value=>{const safe=safeImage(value);if(!safe)throw new Error('Every photo must be a valid upload or HTTPS image URL.');return safe;}))];
    const image=images.includes(input.image)?input.image:images[0];
    if(input.source && !safeSource(input.source)) throw new Error('Original listing link must start with https://.');
    return {id:text('id',100)||crypto.randomUUID(),name:text('name'),brand:text('brand',80),year,price,category:input.category,image,images,
      engine:text('engine')||'Enquire for specifications',mileage:text('mileage')||'Enquire for mileage',transmission:text('transmission')||'Confirm with team',body:text('body')||'Confirm with team',note:text('note',3000),source:safeSource(input.source),
      status:statuses.includes(input.status)?input.status:'Available',branch:branches.includes(input.branch)?input.branch:'Bukit Jalil'};
  }
  function read() {
    try { const raw=localStorage.getItem(KEY); if(raw===null) return {cars:defaults.map(clean),custom:false,error:''};
      const data=JSON.parse(raw);if(data.version!==1 || !Array.isArray(data.cars) || data.cars.length>500) throw new Error('Invalid inventory format.');
      const cars=data.cars.map(clean);if(new Set(cars.map(c=>c.id)).size!==cars.length)throw new Error('Duplicate vehicle IDs.');
      return {cars,custom:true,error:''};
    } catch { return {cars:defaults.map(clean),custom:false,error:'Saved preview inventory could not be read. Original listings are shown. Export a backup before resetting.'}; }
  }
  function write(cars) {
    if(!PREVIEW_MODE) throw new Error('Production storage and authentication are not configured. Preview saving is disabled.');
    if(!Array.isArray(cars) || cars.length>500) throw new Error('Inventory must contain no more than 500 vehicles.');
    const checked=cars.map(clean);if(new Set(checked.map(c=>c.id)).size!==checked.length)throw new Error('Duplicate vehicle IDs.');
    try {localStorage.setItem(KEY,JSON.stringify({version:1,savedAt:new Date().toISOString(),cars:checked}));}
    catch {throw new Error('Browser storage is full or blocked. Export a backup, use smaller photos, or remove unused vehicles, then try again.');}
    window.dispatchEvent(new Event('luxedrive-inventory'));
    return checked;
  }
  function reset(){if(!PREVIEW_MODE)throw new Error('Preview mode is disabled.');localStorage.removeItem(KEY);window.dispatchEvent(new Event('luxedrive-inventory'));}
  window.LuxeInventory={PREVIEW_MODE,KEY,read,write,reset,clean,safeImage,safeSource,escape,statuses,categories,branches};
})();
