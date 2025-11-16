import type { H3Event } from "h3";
import { defineEventHandler, getQuery, createError } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";

import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../../../utils";
import { EnumModel } from "../../../../../../models/enum.schema";
import type { IEnumResponse } from "../../../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);
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

    const result = {
      _id: enumDoc._id,
      syscode: enumDoc.syscode,
      name: enumDoc.name,
      description: enumDoc.description,
      items: enumDoc.items,
      createdAt: enumDoc.createdAt,
      updatedAt: enumDoc.updatedAt,
    };

    RESOLVE_FACTORY(result, query.factory);

    return {
      data: result,
      meta: { total: result.items?.length || 0 },
    };
  }
);
