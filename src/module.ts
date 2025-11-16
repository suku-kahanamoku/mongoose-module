import { defineNuxtModule, createResolver, addServerPlugin } from "@nuxt/kit";
import * as fs from "node:fs";

import { GENERATE_API_ENDPOINT } from "@suku-kahanamoku/common-module/server-utils";

/**
 * @typedef {Object} ModuleOptions
 * @description
 * Rozhraní pro možnosti konfigurace modulu `mongoose-module`.
 */
export interface ModuleOptions {}

/**
 * @module mongoose-module
 * @description
 * Tento modul poskytuje integraci s MongoDB pomocí Mongoose v Nuxt aplikaci.
 * Přidává serverový plugin pro připojení k databázi a generuje API endpointy pro kontrolu zdraví.
 *
 * @example
 * ```typescript
 * export default defineNuxtConfig({
 *   mongooseModule: {},
 * });
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "mongoose-module", // Název modulu
    configKey: "mongooseModule", // Klíč pro konfiguraci v Nuxt configu
  },
  // Výchozí možnosti konfigurace Nuxt modulu
  defaults: {},

  /**
   * @function setup
   * @description
   * Hlavní funkce modulu, která nastavuje serverový plugin a generuje API endpointy.
   *
   * @param {ModuleOptions} _options - Uživatelské možnosti konfigurace.
   * @param {Nuxt} _nuxt - Instance Nuxt aplikace.
   */
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url);

    // Přidání serverového pluginu pro připojení k MongoDB
    addServerPlugin(resolve("./runtime/server/plugins/mongoose"));

    // Generování API endpointů pro kontrolu zdraví
    const healthApiDir = resolve("./runtime/server/api/health");
    fs.readdirSync(healthApiDir)?.forEach((file) => {
      GENERATE_API_ENDPOINT(file, "/api/health", resolve);
    });

    // Generování API endpointů pro enum CRUD
    const enumApiDir = resolve("./runtime/server/api/admin/enum");
    if (fs.existsSync(enumApiDir)) {
      fs.readdirSync(enumApiDir)?.forEach((file) => {
        GENERATE_API_ENDPOINT(file, "/api/admin/enum", resolve);
      });
    }

    // Generování API endpointů pro [_id] v enum
    const enumIdApiDir = resolve("./runtime/server/api/admin/enum/[_id]");
    if (fs.existsSync(enumIdApiDir)) {
      fs.readdirSync(enumIdApiDir)?.forEach((file) => {
        GENERATE_API_ENDPOINT(file, "/api/admin/enum", resolve, "[_id]");
      });
    }

    // Generování API endpointů pro [_id]/[_id] v enum (items)
    const enumItemsApiDir = resolve(
      "./runtime/server/api/admin/enum/[_id]/[_id]"
    );
    if (fs.existsSync(enumItemsApiDir)) {
      fs.readdirSync(enumItemsApiDir)?.forEach((file) => {
        GENERATE_API_ENDPOINT(file, "/api/admin/enum", resolve, "[_id]/[_id]");
      });
    }
  },
});
