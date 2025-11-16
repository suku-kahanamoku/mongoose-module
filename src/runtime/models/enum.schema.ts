import { Schema, model } from "mongoose";

import type { IEnum, IEnumItem } from "../types/enum.interface";

export const EnumItemSchema = new Schema<IEnumItem>(
  {
    syscode: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    raw: {
      type: Schema.Types.Mixed,
    },
  },
  {
    _id: false,
  }
);

export const EnumSchema = new Schema<IEnum>(
  {
    syscode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    items: [EnumItemSchema],
  },
  {
    timestamps: true,
  }
);

export const EnumModel = model<IEnum>("enums", EnumSchema);
