document.addEventListener("DOMContentLoaded", () => {
	const yearSelect = document.getElementById("filter-year");
	const monthSelect = document.getElementById("filter-month");

	const usedYears = new Set();
	const usedMonths = new Set();

	const lazyImages = document.querySelectorAll('img.lazy-image');

	lazyImages.forEach(img => {
		img.addEventListener('load', () => {
			img.classList.add('loaded');
		});

		if (img.complete) {
			img.classList.add('loaded');
		}
  	});

	document.querySelectorAll('[data-js-action="expandInfo"]').forEach(button => {
		button.addEventListener("click", () => {
			const container = button.closest(".image-container");
			const description = container.querySelector(".description");

			description.classList.toggle("show");
			button.textContent = description.classList.contains("show")
				? "Hide Information"
				: "Show Information";
		});
	});

	document.querySelectorAll(".image-container").forEach(container => {
		const year = container.getAttribute("img-y");
		const month = container.getAttribute("img-m");
		const day = container.getAttribute("img-d");
		const time = container.getAttribute("img-t");

		if (year && month && day && time) {
			const [hourStr, minuteStr] = time.split("-");
			const hour = parseInt(hourStr);
			const minute = parseInt(minuteStr);

			const datePart = `${day}/${month}/${year}`;
			const fullTime = `${hourStr.padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;

			const isPM = hour >= 12;
			const hour12 = hour % 12 === 0 ? 12 : hour % 12;
			const formatted12h = `${hour12}:${minuteStr.padStart(2, '0')} ${isPM ? "p.m." : "a.m."}`;

			const fullString = `${datePart} ${fullTime} (${formatted12h})`;

			const description = container.querySelector(".description");
			const dateRow = description?.children[0];
			const dateValue = dateRow?.querySelectorAll("a")[1];
			if (dateValue) {
				dateValue.textContent = fullString;
			}
		}
	});

	function filterImages() {
		const selectedYear = yearSelect?.value;
		const selectedMonth = monthSelect?.value;
		const containers = document.querySelectorAll(".image-container");
		const noResultsDiv = document.getElementById("no-results");

		let anyVisible = false;

		containers.forEach(container => {
			const imgYear = container.getAttribute("img-y");
			const imgMonth = container.getAttribute("img-m");

			const matchYear = !selectedYear || imgYear === selectedYear;
			const matchMonth = !selectedMonth || imgMonth === selectedMonth;

			const show = matchYear && matchMonth;
			container.style.display = show ? "block" : "none";

			if (show) anyVisible = true;
		});

		if (noResultsDiv) {
			noResultsDiv.style.display = anyVisible ? "none" : "block";
		}
	}

	document.querySelectorAll(".image-container").forEach(container => {
		usedYears.add(container.getAttribute("img-y"));
		usedMonths.add(container.getAttribute("img-m"));
	});

	if (yearSelect) {
		Array.from(yearSelect.options).forEach(option => {
			if (option.value === "") return;
			option.disabled = !usedYears.has(option.value);
		});
	}

	if (monthSelect) {
		Array.from(monthSelect.options).forEach(option => {
			if (option.value === "") return;
			option.disabled = !usedMonths.has(option.value);
		});
	}

	if (yearSelect && monthSelect) {
		yearSelect.addEventListener("change", filterImages);
		monthSelect.addEventListener("change", filterImages);
	}
});

window.addEventListener("load", () => {
	const lazyImages = document.querySelectorAll("img.lazy-image");

	setTimeout(() => {
		lazyImages.forEach(img => {
			const realSrc = img.getAttribute("data-src");
			if (!realSrc) return;

			const highResImg = new Image();
			highResImg.src = realSrc;

			highResImg.onload = () => {
			img.src = realSrc;
			img.classList.add("loaded");
			};
		});
	}, 2000);
});