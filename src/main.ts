import { createApp } from "vue";

import "modern-normalize";
import "./style.css";
import App from "./components/App.vue";

const app = createApp(App).mount(document.body, true);
if (true) (window as any).vue = app;
