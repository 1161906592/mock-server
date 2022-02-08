/// <reference types="node" />
import { ParsedUrlQuery } from "querystring";
interface BaseResponse {
    status: number;
    data: unknown;
    message: string;
}
export interface MockModule {
    url: string;
    method: "get" | "post" | "put" | "delete";
    data: BaseResponse | ((query: ParsedUrlQuery, data: unknown) => BaseResponse);
    timeout?: number;
}
export {};
