document.addEventListener('DOMContentLoaded', () => {
    fetch('/assets/images.json')
        .then(resp => resp.json())
        .then(data => {
            const gallery = document.getElementById('gallery');
            
            data.images.sort((a, b) => {
                const dateA = parseDateString(a.date);
                const dateB = parseDateString(b.date);
                return dateB - dateA;
            });

            let lastMonthYear = '';
            
            data.images.forEach(img => {
                try {
                    const dateObj = parseDateString(img.date);
                    
                    if (isNaN(dateObj)) {
                        throw new Error(`Invalid date: ${img.date}`);
                    }
                    
                    const monthYear = dateObj.toLocaleString('en-US', {
                        month: 'long',
                        year: 'numeric'
                    });

                    if (monthYear !== lastMonthYear) {
                        const head = document.createElement('div');
                        head.classList.add('image-date-head');
                        head.textContent = monthYear;
                        gallery.appendChild(head);
                        lastMonthYear = monthYear;
                    }

                    const block = document.createElement('div');
                    block.classList.add('image-container');
                    
                    const [datePart, timePart] = img.date.split(' ');
                    const [year, month, day] = datePart.split('-');
                    block.setAttribute('img-y', year);
                    block.setAttribute('img-m', month);
                    block.setAttribute('img-d', day);
                    block.setAttribute('img-t', timePart.replace(':', '-'));

                    const imgWrap = document.createElement('div');
                    imgWrap.classList.add('image');
                    const imageEl = document.createElement('img');
                    imageEl.alt = img.description;
                    imageEl.loading = 'lazy';
                    imageEl.src = img.image_url;
                    imgWrap.appendChild(imageEl);
                    block.appendChild(imgWrap);

                    const btn = document.createElement('button');
                    btn.classList.add('toggle-button');
                    btn.textContent = 'Show Information';
                    block.appendChild(btn);

                    const desc = document.createElement('div');
                    desc.classList.add('description');

                    function addRow(label, value, link) {
                        const row = document.createElement('div');
                        const a1 = document.createElement('a');
                        a1.textContent = label;
                        row.appendChild(a1);
                        const a2 = document.createElement('a');
                        if (link) {
                            a2.href = link;
                            a2.target = '_blank';
                            a2.classList.add('location-linkout');
                        }
                        a2.textContent = value;
                        row.appendChild(a2);
                        desc.appendChild(row);
                    }

                    const formattedDate = formatDateForDisplay(dateObj);
                    addRow('Date:', formattedDate);

                    addRow('Location:', img.location.name, img.location.maps_url);
                    addRow('Resolution:', img.resolution);
                    addRow('Shot on:', img.shot_on);
                    addRow('Size:', img.size);

                    const flexCol = document.createElement('div');
                    flexCol.classList.add('flex-column');
                    const aLens = document.createElement('a');
                    aLens.textContent = 'Lens information:';
                    flexCol.appendChild(aLens);
                    const table = document.createElement('table');
                    table.classList.add('lens-table');
                    const tr = document.createElement('tr');
                    ['focal_length', 'iso', 'shutter_speed'].forEach(key => {
                        const td = document.createElement('td');
                        td.textContent = img.lens[key];
                        tr.appendChild(td);
                    });
                    table.appendChild(tr);
                    flexCol.appendChild(table);
                    desc.appendChild(flexCol);

                    block.appendChild(desc);

                    btn.addEventListener('click', () => {
                        desc.classList.toggle('show');
                        btn.textContent = desc.classList.contains('show') 
                            ? 'Hide Information' 
                            : 'Show Information';
                    });

                    gallery.appendChild(block);
                    
                } catch (error) {
                    console.error('Error processing image:', img, error);
                }
            });
        })
        .catch(err => console.error('Error loading images.json:', err));

    function parseDateString(dateStr) {
        const [datePart, timePart] = dateStr.split(' ');
        const [year, month, day] = datePart.split('-');
        
        const lastDayOfMonth = new Date(year, month, 0).getDate();
        const correctedDay = Math.min(day, lastDayOfMonth);
        
        return new Date(`${year}-${month}-${correctedDay}T${timePart}:00`);
    }

    function formatDateForDisplay(dateObj) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        
        const hours = dateObj.getHours();
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        
        const period = hours >= 12 ? 'p.m.' : 'a.m.';
        const twelveHour = hours % 12 || 12;
        
        return `${day}/${month}/${year} ${hours}:${minutes} (${twelveHour}:${minutes} ${period})`;
    }
});