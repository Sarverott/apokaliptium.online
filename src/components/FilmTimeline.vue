<script setup>
defineProps({ steps: { type: Array, required: true } });
</script>
<template>
	<div
		class="film-timeline"
		tabindex="0"
		aria-label="Sześć kadrów wizji przyszłości. Przewijaj poziomo."
	>
		<article v-for="step in steps" :key="step.title" class="timeline-frame">
			<div
				class="timeline-image"
				:style="{ backgroundPosition: `${step.positionPercent}% center` }"
				role="img"
				:aria-label="`${step.title} — kadr wizji przyszłości`"
			></div>
			<span>{{ step.label }}</span>
			<h3>{{ step.title }}</h3>
			<p>{{ step.desc }}</p>
		</article>
	</div>
</template>
<style scoped>
.film-timeline {
	display: flex;
	overflow-x: auto;
	scroll-snap-type: x mandatory;
	padding: 20px 9% 35px;
	gap: 12px;
	scrollbar-color: #ddbc8055 #101820;
}

.timeline-frame {
	min-width: 250px;
	width: 25vw;
	max-width: 390px;
	flex-shrink: 0;
	scroll-snap-align: center;
}

.timeline-image {
	height: 290px;
	background-image: url("/assets/future.webp");
	background-size: 600% 100%;
	border: 1px solid #ffffff20;
	transition:
		transform 0.6s,
		filter 0.6s;
	filter: saturate(0.75);
}

.timeline-frame:hover .timeline-image {
	transform: translateY(-6px);
	filter: saturate(1.15);
}

.timeline-frame span {
	display: block;
	font:
		9px "Space Grotesk",
		sans-serif;
	color: var(--accent);
	letter-spacing: 0.16em;
	margin-top: 20px;
}

.timeline-frame h3 {
	font-size: 18px;
	font-weight: 400;
	margin: 12px 0;
}

.timeline-frame p {
	font-size: 12px;
	line-height: 1.7;
	color: #a5adb4;
	max-width: 240px;
}

@media (max-width: 800px) {
	.timeline-frame {
		min-width: 250px;
	}
	.timeline-image {
		height: 300px;
	}
	.film-timeline {
		padding-left: 8%;
		padding-right: 8%;
	}
}
</style>
