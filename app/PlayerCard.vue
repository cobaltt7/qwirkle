<template>
	<div :class="{ active }">
		<img
			:src="`https://api.dicebear.com/5.x/fun-emoji/png?backgroundType=gradientLinear,solid&seed=${player.username}`"
			:alt="`${player.username}'s avatar`"
		/>
		<p>
			{{ player.username }} <span v-if="scores">{{ player.score }}</span>
		</p>
	</div>
</template>
<script lang="ts">
	import { Vue, Prop, Component } from "vue-facing-decorator";
	import type { Player } from "../common/types";
	import type App from "./App.vue.ts";

	@Component
	export default class PlayerCard extends Vue {
		@Prop() scores?: boolean;
		@Prop({ default: false }) active!: boolean;
		@Prop({ required: true }) player!: Player & { username: string };

		declare readonly $root: App;
	}
</script>
<style scoped>
	div {
		display: flex;
		flex-wrap: nowrap;
		flex-direction: column;
		justify-content: space-around;
		margin: 0 5px;
		background: #555;
		align-items: center;
		color: white;
		padding: 5px;
		border-radius: 10px;
		min-width: 200px;
		height: 100%;
	}

	.active {
		background-color: rgb(43, 43, 43);
	}

	img {
		height: 90px;
		width: 90px;
	}

	p {
		margin: 0;
	}

	span {
		align-items: center;
		background-color: orange;
		border-radius: 25px;
		color: #000;
		display: inline-flex;
		justify-content: center;
		padding: 0 5px;
	}
</style>
