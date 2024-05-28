// globals.d.ts
declare global {
  const definePageMeta: (typeof import("nuxt"))["definePageMeta"];
  const navigateTo: (typeof import("nuxt"))["navigateTo"];
}

export {};
