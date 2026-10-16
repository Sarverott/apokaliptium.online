<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({ total: { type: Number, required: true } });

const frame = ref(1);
const progress = ref(0);
const pad = (n) => String(n).padStart(2, "0");

// The current frame is the last scene whose top has passed 45% of the
// viewport; progress is the scrolled share of the page.
let scheduled = false;
function update() {
	const y = scrollY + innerHeight * 0.45;
	let index = 0;
	document.querySelectorAll(".scene").forEach((scene, i) => {
		if (scene.offsetTop <= y) index = i;
	});
	frame.value = Math.min(index + 1, props.total);
	const max = document.documentElement.scrollHeight - innerHeight;
	progress.value = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
	scheduled = false;
}

function onScroll() {
	if (!scheduled) {
		scheduled = true;
		requestAnimationFrame(update);
	}
}

onMounted(() => {
	addEventListener("scroll", onScroll, { passive: true });
	update();
});
onBeforeUnmount(() => removeEventListener("scroll", onScroll));
</script>
<template>
	<aside class="rail" aria-hidden="true">
		<span>APOKALIPTIUM / THE LONG VIEW</span>
		<div class="track"><i id="progress" :style="{ height: `${progress}%` }"></i></div>
		<b id="counter">{{ pad(frame) }} / {{ pad(total) }}</b>
	</aside>
</template>
<style scoped>
.rail {
	font-family: "Space Grotesk", sans-serif;
	position: fixed;
	left: 20px;
	top: 32%;
	z-index: 25;
	display: flex;
	align-items: center;
	gap: 20px;
	writing-mode: vertical-rl;
	font-size: 8px;
	letter-spacing: 0.2em;
	color: #ffffff90;
	mix-blend-mode: screen;
}

.track {
	width: 1px;
	height: 110px;
	background: #ffffff30;
	position: relative;
}

.track i {
	display: block;
	width: 1px;
	height: 0;
	background: var(--accent);
}

@media (max-width: 800px) {
	.rail {
		display: none;
	}
}
</style>
