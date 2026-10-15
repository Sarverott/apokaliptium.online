// NOTE: all of below code need to be rewritten into vue and react components used by astro base 


const menu = document.querySelector("#menu"),
	nav = document.querySelector("#chapters"),
	motion = document.querySelector("#motion");
menu.addEventListener("click", () => {
	nav.hidden = !nav.hidden;
	menu.setAttribute("aria-expanded", String(!nav.hidden));
});
nav.querySelectorAll("a").forEach((a) =>
	a.addEventListener("click", () => {
		nav.hidden = true;
		menu.setAttribute("aria-expanded", "false");
	}),
);
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		nav.hidden = true;
		menu.setAttribute("aria-expanded", "false");
		menu.focus();
	}
});
let paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
function setMotion() {
	document.body.classList.toggle("paused", paused);
	motion.setAttribute("aria-pressed", String(paused));
	motion.innerHTML = paused
		? "▶ <span>Wznów ruch</span>"
		: "Ⅱ <span>Zatrzymaj ruch</span>";
}
setMotion();
motion.addEventListener("click", () => {
	paused = !paused;
	setMotion();
});
const scenes = [...document.querySelectorAll(".scene")];
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((e) => {
			e.target.classList.toggle("visible", e.isIntersecting);
		});
	},
	{ threshold: 0.12 },
);
scenes.forEach((s) => observer.observe(s));
let scheduled = false;
function update() {
	const y = scrollY + innerHeight * 0.45;
	let idx = 0;
	scenes.forEach((s, i) => {
		if (s.offsetTop <= y) idx = i;
	});
	document.querySelector("#counter").textContent =
		String(idx + 1).padStart(2, "0") + " / 07";
	document.querySelector("#progress").style.height =
		(scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100 +
		"%";
	scheduled = false;
}
addEventListener(
	"scroll",
	() => {
		if (!scheduled) {
			scheduled = true;
			requestAnimationFrame(update);
		}
	},
	{ passive: true },
);
update();
const wave = document.querySelector(".wave");
for (let i = 0; i < 48; i++) {
	const el = document.createElement("i");
	el.style.animationDelay = -i * 0.137 + "s";
	el.style.animationDuration = 0.5 + (i % 7) * 0.17 + "s";
	wave.append(el);
}
const steps = [
	["Dzisiaj", "Rozproszenie, problemy, ale też ogromny potencjał."],
	["Łączymy wiedzę", "Otwarte zasoby, edukacja, społeczność i narzędzia."],
	["Budujemy infrastrukturę", "Lokalnie i globalnie. Fizycznie i cyfrowo."],
	["Rozwijamy technologie", "Prototypy, produkcja i praktyczne zastosowania."],
	["Tworzymy społeczność", "Ludzie, AI, edukacja, kultura i współpraca."],
	[
		"Cywilizacja typu III",
		"Daleki horyzont świadomej, zrównoważonej cywilizacji.",
	],
];
steps.forEach(([title, desc], i) => {
	const card = document.createElement("article");
	card.className = "timeline-frame";
	const art = document.createElement("div");
	art.className = "timeline-image";
	art.style.backgroundPosition = i * 20 + "% center";
	art.setAttribute("role", "img");
	art.setAttribute("aria-label", title + " — kadr wizji przyszłości");
	card.append(art);
	const n = document.createElement("span");
	n.textContent =
		"0" + (i + 1) + " / " + (i === 5 ? "THE HORIZON" : "THE JOURNEY");
	const h = document.createElement("h3");
	h.textContent = title;
	const p = document.createElement("p");
	p.textContent = desc;
	card.append(n, h, p);
	document.querySelector(".film-timeline").append(card);
});
