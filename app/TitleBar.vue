<template>
	<header><h1>Qwirkle</h1></header>
</template>
<script lang="ts">
import { Component, Vue } from "vue-facing-decorator";

@Component
export default class TitleBar extends Vue {}
</script>
<style scoped>
header {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	height: 100px;
	font-size: 1.5em;
}

h1 {
	margin: auto;
}
</style>
