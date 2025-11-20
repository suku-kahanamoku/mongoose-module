import type { IItem, IResponse } from "@suku-kahanamoku/common-module/types";

export interface IEnumItem {
  syscode: string;
  name?: string;
  description?: string;
  disabled?: boolean;
  hidden?: boolean;
  raw?: any;
}

export interface IEnum extends IItem {
  syscode: string;
  name?: string;
  description?: string;
  items: IEnumItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEnumResponse extends IResponse {
  data?: IEnum;
}

export interface IEnumsResponse extends IResponse {
  data?: IEnum[];
}
