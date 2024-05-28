// types/app.d.ts
declare module "#app" {
  import { InjectionKey } from "vue";
  import { NuxtApp } from "@nuxt/types/app";

  export { defineNuxtPlugin, NuxtApp };

  export function navigateTo(
    url: string,
    options?: { external?: boolean }
  ): Promise<void>;

  interface NuxtApp {
    provide<T>(key: InjectionKey<T> | string, value: T): void;
  }
}
