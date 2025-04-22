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

@Component
export default class PlayerCard extends Vue {
	@Prop() scores?: boolean;
	@Prop({ default: false }) active!: boolean;
	@Prop({ required: true }) player!: Player & { username: string };
}
</script>
<style scoped>
div {
	display: flex;
	flex-direction: column;
	flex-wrap: nowrap;
	justify-content: space-around;
	align-items: center;
	margin: 0 5px;
	border-radius: 10px;
	background: #555;
	padding: 5px;
	width: 200px;
	height: 140px;
	color: white;
}

.active {
	background-color: rgb(43, 43, 43);
}

img {
	width: 90px;
	height: 90px;
}

p {
	margin: 0;
}

span {
	display: inline-flex;
	justify-content: center;
	align-items: center;
	border-radius: 25px;
	background-color: orange;
	padding: 0 5px;
	color: #000;
}
</style>
