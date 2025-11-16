import type { H3Event } from "h3";
import { defineEventHandler, getQuery, createError } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";

import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../../../utils";
import { EnumModel } from "../../../../../../models/enum.schema";
import type { IEnumResponse } from "../../../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);
    const enumSyscode = event.context.params?.id;
    const itemSyscode = query.itemSyscode as string;

    if (!itemSyscode) {
      throw createError({
        statusCode: 400,
        statusMessage: "itemSyscode query parameter is required",
      });
    }

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    const enumDoc = await EnumModel.findOne({ syscode: enumSyscode });
    if (!enumDoc) {
      throw createError({
        statusCode: 404,
        statusMessage: "Enum not found",
      });
    }

    // Najdeni a odstraneni itemu
    const itemIndex =
      enumDoc.items?.findIndex((item) => item.syscode === itemSyscode) ?? -1;
    if (itemIndex === -1) {
      throw createError({
        statusCode: 404,
        statusMessage: "Item not found in enum",
      });
    }

    // Odstraneni itemu z pole
    const removedItem = enumDoc.items?.splice(itemIndex, 1)[0];

    const result = await enumDoc.save();
    const enumObject = result.toObject();

    RESOLVE_FACTORY(enumObject, query.factory);

    return {
      data: {
        ...enumObject,
        removedItem,
      },
      meta: { total: enumObject.items?.length || 0 },
    };
  }
);
