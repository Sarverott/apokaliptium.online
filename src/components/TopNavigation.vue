<script setup>
import { onBeforeUnmount, onMounted } from "vue";
import { ui } from "../lib/ui.js";

defineProps({ chapters: { type: Array, required: true } });

function close() {
	ui.menuOpen = false;
}

// Escape closes an open menu and returns focus to the button that opened it.
function onKeydown(event) {
	if (event.key === "Escape" && ui.menuOpen) {
		close();
		document.querySelector("#menu")?.focus();
	}
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));
</script>
<template>

<nav id="chapters" aria-label="Rozdziały" :hidden="!ui.menuOpen">
      <span class="eyebrow">WYBIERZ KLATKĘ</span
      ><a
        v-for="chapter in chapters"
        :key="chapter.id"
        :href="`#${chapter.id}`"
        @click="close"
        >{{ chapter.number }} / {{ chapter.title }}</a
      >
    </nav>

</template>
<style lang="css" scoped>
#chapters {
	position: fixed;
	right: 3%;
	top: 80px;
	background: #101820f5;
	border: 1px solid #ffffff30;
	padding: 36px;
	z-index: 50;
	width: min(430px, 94%);
	backdrop-filter: blur(20px);
}

#chapters[hidden] {
	display: none;
}

#chapters a {
	display: block;
	padding: 16px 0;
	border-bottom: 1px solid #ffffff15;
	font-size: 15px;
}

#chapters a:hover {
	color: var(--accent);
}
</style>
