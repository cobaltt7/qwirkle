declare module "vue-dragscroll" {
	import { App, DirectiveBinding, VNode } from "vue";

	export const dragscroll: {
		mounted: (el: Element, binding: DirectiveBinding, vnode: VNode) => void;
		updated: (el: Element, binding: DirectiveBinding, vnode: VNode) => void;
		unmounted: (el: Element) => void;
	};

	const VueDragscroll: { install<T extends App>(app: T): T };
	export default VueDragscroll;
}
