<template>
	<header><h1>Qwirkle</h1></header>
</template>
<script lang="ts">
	import { Component, Vue } from "vue-facing-decorator";
	import type App from "./App.vue";

	@Component
	export default class TitleBar extends Vue {
		declare readonly $root: App;
	}
</script>
<style scoped>
	header {
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 1.5em;
		height: 100px;
		width: 100%;
	}

	h1 {
		margin: auto;
	}
</style>
