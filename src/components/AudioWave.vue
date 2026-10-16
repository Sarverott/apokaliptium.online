<script setup>
// 48 bars with staggered delays and durations; the animation is pure CSS.
const bars = Array.from({ length: 48 }, (_, i) => ({
	delay: `${-i * 0.137}s`,
	duration: `${0.5 + (i % 7) * 0.17}s`,
}));
</script>
<template>
	<div class="wave" aria-hidden="true">
		<i
			v-for="(bar, i) in bars"
			:key="i"
			:style="{ animationDelay: bar.delay, animationDuration: bar.duration }"
		></i>
	</div>
</template>
<style scoped>
.wave {
	height: 40px;
	display: flex;
	align-items: center;
	gap: 4px;
	margin: 30px 0;
}

.wave i {
	width: 2px;
	background: var(--accent);
	height: 15px;
	animation: wave 1s ease-in-out infinite alternate;
	opacity: 0.7;
}

@keyframes wave {
	to {
		height: 38px;
		opacity: 0.3;
	}
}
</style>
