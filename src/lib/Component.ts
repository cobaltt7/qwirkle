import { ComponentOptions, defineAsyncComponent } from "./vue.js";
import { Options, Vue, VueBase, VueConstructor } from "./vue-class-component.js";
import useCss from "./vue-use-css.js";

export default function <V extends Vue>(
	options: ComponentOptions & ThisType<V> & { template?: never; render?: never } = {},
) {
	return function <VC extends VueConstructor<VueBase>>(app: VC) {
		return defineAsyncComponent(async () => {
			const rawCss = await fetch(
				new URL(`../../components/${app.name}.css`, import.meta.url),
			).then((response) => (response.ok ? response.text() : undefined));
			const css = rawCss?.replace(/this ([^{}])+{/g, (selectors) => {
				return selectors
					.split(",")
					.map((selector) =>
						selector.trim().startsWith("this")
							? selector.replace("this", "&")
							: selector,
					)
					.join(", ");
			});

			const html = await fetch(new URL(`../../components/${app.name}`, import.meta.url)).then(
				(response) => response.text(),
			);
			const dom = new DOMParser().parseFromString(html, "text/html");
			const oldMounted = app.prototype.mounted;
			const template = dom.querySelector("template");

			app.prototype.mounted = function mounted() {
				const attrs = useCss(css ?? "");
				let el =
					this.$el instanceof HTMLElement
						? this.$el
						: (this.$el as Text).nextElementSibling;
				for (let index = 0; index < (template?.content?.childElementCount ?? 0); index++) {
					for (const name in attrs) {
						if (!Object.prototype.hasOwnProperty.call(attrs, name)) return;
						el?.setAttribute(name, attrs[name]?.toString() ?? "");
					}
					el = el?.nextElementSibling ?? null;
				}
				oldMounted?.call(this);
			};
			return Options({ ...options, template: template?.innerHTML })(app);
		});
	};
}
