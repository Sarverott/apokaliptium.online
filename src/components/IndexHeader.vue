<script setup>
import { onMounted, ref, watch } from "vue";
import { ui } from "../lib/ui.js";

// Motion starts paused when the visitor prefers reduced motion; the
// `paused` class on <body> stops every animation (see BaseLayout.astro).
const paused = ref(false);
watch(paused, (value) => document.body.classList.toggle("paused", value));
onMounted(() => {
	paused.value = matchMedia("(prefers-reduced-motion: reduce)").matches;
});
</script>
<template>

<header>
      <a class="brand" href="#opening"
        ><span class="sigil">◈</span> APOKALIPTIUM</a
      >
      <div class="header-right">
        <span class="edition">A VISION IN MOTION / 001</span
        ><button
          id="motion"
          type="button"
          :aria-pressed="String(paused)"
          @click="paused = !paused"
        >
          <template v-if="paused">▶ <span>Wznów ruch</span></template>
          <template v-else>Ⅱ <span>Zatrzymaj ruch</span></template></button
        ><button
          id="menu"
          type="button"
          :aria-expanded="String(ui.menuOpen)"
          aria-controls="chapters"
          @click="ui.menuOpen = !ui.menuOpen"
        >
          Rozdziały <span>☰</span>
        </button>
      </div>
    </header>
</template>
<style scoped>
header {
	height: 88px;
	padding: 0 5%;
	display: flex;
	align-items: center;
	justify-content: space-between;
	position: absolute;
	top: 0;
	width: 100%;
	z-index: 30;
	border-bottom: 1px solid #ffffff24;
	background: linear-gradient(#03070be0, transparent);
}

.brand {
	font:
		500 16px "Space Grotesk",
		sans-serif;
	letter-spacing: 0.36em;
	display: flex;
	align-items: center;
	gap: 18px;
}

.sigil {
	font-size: 36px;
	color: var(--accent);
}

.header-right {
	display: flex;
	align-items: center;
	gap: 30px;
}

.edition {
	font-family: "Space Grotesk", sans-serif;
	font-size: 9px;
	letter-spacing: 0.16em;
	color: #b3b5b6;
}

button {
	font: inherit;
	font-family: "Space Grotesk", sans-serif;
	color: inherit;
	cursor: pointer;
	background: none;
	border: 0;
	font-size: 11px;
	letter-spacing: 0.08em;
	padding: 10px 0;
}

#menu span {
	margin-left: 12px;
	color: var(--accent);
}

@media (max-width: 800px) {
	header {
		height: 72px;
		padding: 0 7%;
	}
	.brand {
		font-size: 11px;
		letter-spacing: 0.2em;
		gap: 8px;
	}
	.sigil {
		font-size: 25px;
	}
	.edition,
	#motion span {
		display: none;
	}
	.header-right {
		gap: 20px;
	}
}
</style>
