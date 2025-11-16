import type { H3Event } from "h3";
import { defineEventHandler, getQuery, readBody, createError } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";
import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../../utils";

import { EnumModel } from "../../../../../models/enum.schema";
import type { IEnumResponse } from "../../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);
    const body = await readBody(event);
    delete body._id;

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    // Kontrola existence enum
    const existingEnum = await EnumModel.findById(event.context.params?.id);
    if (!existingEnum) {
      throw createError({
        statusCode: 404,
        statusMessage: "Enum not found",
      });
    }

    // Kontrola syscode duplicity (pokud se meni)
    if (body.syscode && body.syscode !== existingEnum.syscode) {
      const duplicateEnum = await EnumModel.findOne({ syscode: body.syscode });
      if (duplicateEnum) {
        throw createError({
          statusCode: 400,
          statusMessage: "Enum with this syscode already exists",
        });
      }
    }

    const result = await EnumModel.findOneAndUpdate(
      { _id: event.context.params?.id },
      body,
      { new: true },
    )
    const enumObject = result?.toObject()

    if (enumObject) {
      RESOLVE_FACTORY(enumObject, query.factory)
    }

    return {
      data: enumObject,
      meta: { total: enumObject ? 1 : 0 },
    }
  }
);
