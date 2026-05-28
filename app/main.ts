import { createPinia } from "pinia";
import { createApp } from "vue";

import "modern-normalize";

import App from "./App.vue";
import "./style.css";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const vue = app.mount(document.body, true);
if (true) (window as any).vue = vue;
