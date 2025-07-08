import type { H3Event } from "h3";
import { defineEventHandler, getQuery } from "#imports";
import mongoose from "mongoose";

import { CONNECT_WITH_RETRY } from "../../utils";

/**
 * @file index.get.ts
 * @description
 * API endpoint pro kontrolu stavu připojení k MongoDB. Umožňuje připojení k databázi, pokud není připojeno,
 * a odpojení na základě dotazu.
 *
 * @example
 * GET /api/health
 * Response: { "status": "connected" }
 *
 * @example
 * GET /api/health?disconnect=true
 * Response: { "status": "disconnected" }
 */
export default defineEventHandler(async (event: H3Event) => {
  // Získání aktuálního stavu připojení k MongoDB
  const dbState = mongoose.connection.readyState;
  const status = dbState === 1 ? "connected" : "disconnected";

  // Pokud není připojeno nebo je připojení ve stavu "disconnecting", pokusí se připojit
  if (![1, 2].includes(dbState)) {
    await CONNECT_WITH_RETRY(); // Použití await pro zajištění dokončení připojení
  }

  // Zpracování dotazu pro odpojení od databáze
  const q = getQuery(event);
  if (q?.disconnect) {
    await mongoose.disconnect(); // Použití await pro správné odpojení
  }

  // Vrácení aktuálního stavu připojení
  return { status };
});
