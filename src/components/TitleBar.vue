<template>
	<header><h1>Qwirkle</h1></header>
</template>
<script lang="ts">
	import { Vue, Options } from "vue-class-component";
	import type App from "./App.vue";

	@Options({})
	export default class TitleBar extends Vue {
		// Data

		// Refs
		declare readonly $refs: {};
		declare readonly $root: App;

		// Hooks

		// Methods
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
