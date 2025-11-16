import type { H3Event } from "h3";
import { defineEventHandler, getQuery, readBody, createError } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";
import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../../../utils";

import { EnumModel } from "../../../../../models/enum.schema";
import type { IEnumResponse } from "../../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);
    const body = await readBody(event);
    const syscode = event.context.params?.id;

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    const enumDoc = await EnumModel.findOne({ syscode });
    if (!enumDoc) {
      throw createError({
        statusCode: 404,
        statusMessage: "Enum not found",
      });
    }

    // Kontrola existence syscode v items
    const existingItem = enumDoc.items?.find(
      (item) => item.syscode === body.syscode
    );
    if (existingItem) {
      throw createError({
        statusCode: 400,
        statusMessage: "Item with this syscode already exists in enum",
      });
    }

    // Pridani noveho itemu
    enumDoc.items = enumDoc.items || [];
    enumDoc.items.push(body);

    const result = await enumDoc.save();
    const enumObject = result.toObject();

    RESOLVE_FACTORY(enumObject, query.factory);

    return {
      data: enumObject,
      meta: { total: enumObject.items?.length || 0 },
    };
  }
);
