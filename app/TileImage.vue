<template>
	<span class="background">
		<span
			class="shape"
			:title="`${color} ${shape}`"
			:style="{ background: color, mask: `url('./assets/${shape}.svg')` }"
		></span>
	</span>
</template>
<script lang="ts">
import { Prop, Vue, Component } from "vue-facing-decorator";
import { TileColor, TileShape } from "../common/constants.js";

@Component
export default class TileImage extends Vue {
	@Prop({ required: true }) color!: TileColor;
	@Prop({ required: true }) shape!: TileShape;
}
</script>
<style scoped>
.background {
	display: inline-block;
	position: relative;
	cursor: var(--cursor);
	background-color: #231f20;
	width: 100%;
	height: 100%;
}
.shape {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
}
</style>
