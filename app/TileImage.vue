<template>
	<img :src="`./assets/${shape}.ts`" :alt="`${color} ${shape}`" :style="{ color }" />
</template>
<script lang="ts">
import { Prop, Vue, Component } from "vue-facing-decorator";
import { TileColor, TileShape } from "../common/constants.ts";

@Component
export default class TileImage extends Vue {
	@Prop({ required: true }) color!: TileColor;
	@Prop({ required: true }) shape!: TileShape;
}
</script>
<style scoped></style>
