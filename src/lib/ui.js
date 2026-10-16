import { reactive } from "vue";

// State shared by the Vue islands. Each island hydrates as its own app, but
// they import this module once, so they see the same reactive object.
export const ui = reactive({ menuOpen: false });
