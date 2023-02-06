// decorators.js
import { ComponentOptions, defineAsyncComponent } from "./vue.js";
import { Options, Vue, VueBase, VueConstructor } from "./vue-class-component.js";

// Declare decorator.
export default function <V extends Vue>(
	options: ComponentOptions & ThisType<V> & { template?: never; render?: never }={},
) {
	return function <VC extends VueConstructor<VueBase>>(app: VC) {
		return defineAsyncComponent(async () => {
			return Options({
				...options,
				template: await fetch(
					new URL(
						`../../components/${app.name.replace(
							/[A-Z]+(?![a-z])|[A-Z]/g,
							(capitals, index) => (index ? "-" : "") + capitals.toLowerCase(),
						)}.html`,
						import.meta.url,
					),
				).then((response) => response.text()),
			})(app);
		});
	};
}
