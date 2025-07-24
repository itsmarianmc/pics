const fields = {
	year: '',
	month: ''
};

// Sets für tatsächlich vorhandene Jahre/Monate
let usedYears = new Set();
let usedMonths = new Set();

// Ermittelt, welche img-y / img-m vorkommen
function collectUsedDateParts() {
	usedYears = new Set();
	usedMonths = new Set();
	document.querySelectorAll('.image-container').forEach(container => {
		const y = container.getAttribute('img-y');
		const m = container.getAttribute('img-m');
		if (y) usedYears.add(y);
		if (m) usedMonths.add(m);
	});
}

// Initialisiert ein Custom-Dropdown, deaktiviert Items ohne Daten und ruft callback bei Auswahl auf
function setupDropdown(dropdownId, fieldKey, callback) {
	const dd = document.getElementById(dropdownId);
	if (!dd) {
		console.error(`Dropdown mit ID "${dropdownId}" nicht gefunden.`);
		return;
	}
	const selected = dd.querySelector('.dropdown__selected');
	const items = Array.from(dd.querySelectorAll('.dropdown__item'));

	// Deaktivieren nicht-belegter Items
	items.forEach(item => {
		const val = item.dataset.value;
		if (val !== '') {
			if (fieldKey === 'year' && !usedYears.has(val)) {
				item.classList.add('disabled');
			}
			if (fieldKey === 'month' && !usedMonths.has(val)) {
				item.classList.add('disabled');
			}
		}
	});

	// Open/Close
	selected.addEventListener('click', e => {
		e.stopPropagation();
		document.querySelectorAll('.dropdown').forEach(d => {
			if (d !== dd) d.classList.remove('open');
		});
		dd.classList.toggle('open');
	});

	// Auswahl nur für nicht-disabled Items
	items.forEach(item => {
		if (item.classList.contains('disabled')) return;
		item.addEventListener('click', e => {
			e.stopPropagation();
			const val = item.dataset.value;
			const txt = item.textContent;
			fields[fieldKey] = val;
			selected.querySelector('span').textContent = txt;
			dd.dataset.value = val;
			items.forEach(i => i.classList.remove('active'));
			item.classList.add('active');
			dd.classList.remove('open');
			callback();
		});
		// aktiven State setzen, falls vorbelegt
		if (item.dataset.value === fields[fieldKey]) {
			item.classList.add('active');
			selected.querySelector('span').textContent = item.textContent;
		}
	});

	// Klick außerhalb schließt Dropdown
	document.addEventListener('click', e => {
		if (!dd.contains(e.target)) {
			dd.classList.remove('open');
		}
	});
}

// Filtert die Bilder nach fields.year und fields.month
function filterImages() {
	const containers = document.querySelectorAll('.image-container');
	const noResultsDiv = document.getElementById('no-results');
	let anyVisible = false;

	containers.forEach(container => {
		const imgYear = container.getAttribute('img-y');
		const imgMonth = container.getAttribute('img-m');
		const matchYear = !fields.year || imgYear === fields.year;
		const matchMonth = !fields.month || imgMonth === fields.month;
		const show = matchYear && matchMonth;
		container.style.display = show ? 'block' : 'none';
		if (show) anyVisible = true;
	});

	if (noResultsDiv) {
		noResultsDiv.style.display = anyVisible ? 'none' : 'block';
	}
}

document.addEventListener('DOMContentLoaded', () => {
	// Sets aktualisieren
	collectUsedDateParts();

	// Lazy-Load: CSS-Klasse nach Laden
	const lazyImages = document.querySelectorAll('img.lazy-image');
	lazyImages.forEach(img => {
		img.addEventListener('load', () => img.classList.add('loaded'));
		if (img.complete) img.classList.add('loaded');
	});

	// "Show Information"-Buttons
	document.querySelectorAll('[data-js-action="expandInfo"]').forEach(btn => {
		btn.addEventListener('click', () => {
			const container = btn.closest('.image-container');
			const description = container.querySelector('.description');
			description.classList.toggle('show');
			btn.textContent = description.classList.contains('show') ?
				'Hide Information' :
				'Show Information';
		});
	});

	// Datum/Uhrzeit formatieren
	document.querySelectorAll('.image-container').forEach(container => {
		const y = container.getAttribute('img-y');
		const m = container.getAttribute('img-m');
		const d = container.getAttribute('img-d');
		const t = container.getAttribute('img-t');
		if (!y || !m || !d || !t) return;

		const [hourStr, minuteStr] = t.split('-');
		const hour = parseInt(hourStr, 10);
		const isPM = hour >= 12;
		const hour12 = hour % 12 === 0 ? 12 : hour % 12;
		const datePart = `${d}/${m}/${y}`;
		const fullTime24h = `${hourStr.padStart(2,'0')}:${minuteStr.padStart(2,'0')}`;
		const formatted12 = `${hour12}:${minuteStr.padStart(2,'0')} ${isPM?'p.m.':'a.m.'}`;
		const fullString = `${datePart} ${fullTime24h} (${formatted12})`;

		const desc = container.querySelector('.description');
		const dateRow = desc?.children[0];
		const dateVal = dateRow?.querySelectorAll('a')[1];
		if (dateVal) dateVal.textContent = fullString;
	});

	setupDropdown('dropdown-year', 'year', filterImages);
	setupDropdown('dropdown-month', 'month', filterImages);

	filterImages();
});

window.addEventListener('load', () => {
	const lazyImages = document.querySelectorAll('img.lazy-image');
	lazyImages.forEach(img => {
		const realSrc = img.getAttribute('data-src');
		if (!realSrc) return;
		const highRes = new Image();
		highRes.src = realSrc;
		highRes.onload = () => {
			img.src = realSrc;
			img.classList.add('loaded');
		};
	});
});