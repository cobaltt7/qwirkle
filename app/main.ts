import { createPinia } from "pinia";
import { createApp } from "vue";

import "modern-normalize";
import "./style.css";

import App from "./App.vue";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

const vue = app.mount(document.body, true);
if (true) (window as any).vue = vue;
