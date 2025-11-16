import type { H3Event } from "h3";
import { defineEventHandler, getQuery } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";

import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../utils";
import { EnumModel } from "../../../../models/enum.schema";
import type { IEnumsResponse } from "../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumsResponse> => {
    const query = getQuery(event);

    const where = JSON.parse((query.q || "{}") as string);
    const limit = Number.parseInt(query.limit as string, 10) || 100;
    const page = Number.parseInt(query.page as string, 10) || 1;
    const skip = (page - 1) * limit;

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    const result = await EnumModel.find(where).limit(limit).skip(skip);

    const total = await EnumModel.countDocuments(where);

    const enums = result?.map((i) => {
      const enumItem = i.toObject();
      RESOLVE_FACTORY(enumItem, query.factory);
      return enumItem;
    });

    return {
      data: enums,
      meta: { total, limit, skip },
    };
  }
);
