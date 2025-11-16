import type { H3Event } from "h3";
import { defineEventHandler, getQuery, readBody, createError } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";
import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../utils";

import { EnumModel } from "../../../models/enum.schema";
import type { IEnumResponse } from "../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);
    const body = await readBody(event);

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    // Kontrola existence syscode
    const existingEnum = await EnumModel.findOne({ syscode: body.syscode });
    if (existingEnum) {
      throw createError({
        statusCode: 400,
        statusMessage: "Enum with this syscode already exists",
      });
    }

    const newEnum = new EnumModel(body);
    const result = await newEnum.save();
    const enumObject = result.toObject();

    RESOLVE_FACTORY(enumObject, query.factory);

    return {
      data: enumObject,
      meta: { total: 1 },
    };
  }
);
