/* Vehicle sheets are generated locally; no customer or inventory data is uploaded. */
(function () {
  'use strict';
  const text = value => String(value ?? '').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"');
  const price = value => 'RM ' + Number(value).toLocaleString('en-MY');

  function build(car, photos, date = new Date()) {
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    doc.setProperties({ title: `${car.year} ${car.name} - LuxeDrive`, subject: 'Vehicle stock, price, specifications and photos', author: 'LuxeDrive' });
    let y = 0;
    const page = () => {
      doc.setFillColor(23, 28, 21); doc.rect(0, 0, 210, 25, 'F');
      doc.setTextColor(217, 186, 117); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text('LUXEDRIVE', 16, 16);
      doc.setFontSize(9); doc.text('VEHICLE STOCK SHEET', 194, 16, { align: 'right' });
      doc.setTextColor(32, 38, 28); y = 36;
    };
    const next = () => { doc.addPage(); page(); };
    const paragraph = (value, size = 10, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size);
      for (const line of doc.splitTextToSize(text(value), 178)) {
        if (y > 268) { next(); doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); }
        doc.text(line, 16, y); y += size * 0.45;
      }
      y += 3;
    };
    const photo = (item, x, top, width, height) => {
      doc.setFillColor(242, 240, 233); doc.rect(x, top, width, height, 'F');
      if (!item.data) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(width < 80 ? 8 : 10);
        const lines = doc.splitTextToSize('Photo unavailable for PDF export', width - 8);
        doc.text(lines, x + width / 2, top + height / 2 - (lines.length - 1) * 2, { align: 'center' });
        return;
      }
      const scale = Math.min(width / item.width, height / item.height);
      const w = item.width * scale, h = item.height * scale;
      doc.addImage(item.data, 'JPEG', x + (width - w) / 2, top + (height - h) / 2, w, h);
    };
    page();
    photo(photos[0] || {}, 16, y, 178, 78); y += 87;
    paragraph(`${car.year} ${car.name}`, 22, true);
    paragraph(price(car.price), 19, true);
    const rows = [['Stock ID', car.id], ['Make / year', `${car.brand} / ${car.year}`], ['Category / status', `${car.category} / ${car.status}`], ['Engine', car.engine], ['Mileage', car.mileage], ['Transmission', car.transmission], ['Body style', car.body], ['Outlet', car.branch]];
    for (const [label, value] of rows) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      const lines = doc.splitTextToSize(text(value || 'Confirm with team'), 120);
      const height = Math.max(8, lines.length * 5 + 3);
      if (y + height > 268) next();
      doc.setDrawColor(220, 221, 215); doc.line(16, y - 4, 194, y - 4);
      doc.setFont('helvetica', 'bold'); doc.text(label, 16, y);
      doc.setFont('helvetica', 'normal'); doc.text(lines, 68, y); y += height;
    }
    if (car.note) { y += 5; paragraph('Listing notes', 11, true); paragraph(car.note); }
    y += 4;
    paragraph('Contact: ' + (car.branch === 'Setia Alam' ? '+60 12-387 8655' : '+60 11-6569 9836'));
    paragraph('Prices, availability and specifications are subject to confirmation. This sheet is not a reservation or a binding quotation.', 9);
    // Keep the full gallery on page 2, even when long notes need continuation pages.
    doc.insertPage(2); doc.setPage(2); page();
    paragraph(`${car.year} ${car.name.slice(0, 70)} - all photos`, 13, true);
    const gallery = photos.length ? photos : [{}];
    const columns = gallery.length <= 2 ? 1 : gallery.length <= 6 ? 2 : 3;
    const rowCount = Math.ceil(gallery.length / columns), gap = 7;
    const cellWidth = (178 - gap * (columns - 1)) / columns;
    const cellHeight = (212 - gap * (rowCount - 1)) / rowCount;
    gallery.forEach((item, index) => {
      const x = 16 + (index % columns) * (cellWidth + gap);
      const top = 55 + Math.floor(index / columns) * (cellHeight + gap);
      photo(item, x, top, cellWidth, cellHeight - 7);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text(`Photo ${index + 1} of ${gallery.length}${index === 0 ? ' - main photo' : ''}`, x, top + cellHeight - 2);
    });
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(105, 110, 100);
      doc.text(`Stock ${text(car.id)} | ${date.toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}`, 16, 285);
      doc.text(`${i} / ${pages}`, 194, 285, { align: 'right' });
    }
    return doc;
  }

  function loadPhoto(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      const timer = setTimeout(() => { image.src = ''; resolve({}); }, 15000);
      image.onerror = () => { clearTimeout(timer); resolve({}); };
      image.onload = () => {
        clearTimeout(timer);
        try {
          const scale = Math.min(1, 1600 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
          const ctx = canvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve({ data: canvas.toDataURL('image/jpeg', 0.86), width: canvas.width, height: canvas.height });
        } catch { resolve({}); }
      };
      image.src = src;
    });
  }

  let busy = false;
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-pdf-id]');
    if (!button || busy) return;
    const car = window.LuxeInventory.read().cars.find(item => item.id === button.dataset.pdfId);
    if (!car) return;
    let status = document.querySelector('#pdf-status');
    if (!status) { status = document.createElement('p'); status.id = 'pdf-status'; status.className = 'pdf-status'; status.setAttribute('role', 'status'); }
    (button.closest('dialog') || document.body).append(status);
    busy = true; button.disabled = true; button.setAttribute('aria-busy', 'true');
    const label = button.textContent; button.textContent = 'Preparing PDF...'; status.textContent = 'Preparing vehicle details and photos...';
    try {
      const sources = [car.image, ...car.images.filter(src => src !== car.image)];
      const photos = await Promise.all(sources.map(loadPhoto));
      const doc = build(car, photos);
      const filename = `LuxeDrive-${car.year}-${car.name}-${car.id}`.replace(/[^a-zA-Z0-9_-]+/g, '-');
      doc.save(filename + '.pdf');
      const missing = photos.filter(item => !item.data).length;
      status.textContent = missing ? `PDF downloaded. ${missing} photo(s) could not be included; they are marked in the PDF.` : 'Vehicle PDF downloaded with price, specifications and photos.';
    } catch { status.textContent = 'The PDF could not be created. Please try again.'; }
    finally { busy = false; button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = label; }
  });
  window.LuxeVehiclePDF = { build };
})();
