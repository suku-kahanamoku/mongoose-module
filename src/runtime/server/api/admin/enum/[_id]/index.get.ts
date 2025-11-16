import type { H3Event } from "h3";
import { defineEventHandler, getQuery } from "#imports";

import { RESOLVE_FACTORY } from "@suku-kahanamoku/common-module/server-utils";

import { GET_STATUS, CONNECT_WITH_RETRY } from "../../../../utils";
import { EnumModel } from "../../../../../models/enum.schema";
import type { IEnumResponse } from "../../../../../types";

export default defineEventHandler(
  async (event: H3Event): Promise<IEnumResponse> => {
    const query = getQuery(event);

    // Nejdrive zkontroluje, zda je pripojeni k databazi
    if (GET_STATUS() === 0) {
      await CONNECT_WITH_RETRY();
    }

    const enumItem = await EnumModel.findOne({ _id: event.context.params?.id });
    const result = enumItem?.toObject();

    if (result) {
      RESOLVE_FACTORY(result, query.factory);
    }

    return {
      data: result,
      meta: { total: result ? 1 : 0 },
    };
  }
);
