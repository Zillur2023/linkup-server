import { Response } from "express";

type TMeta = {
  limit: number;
  page: number;
  total: number;
  totalPage: number;
};

type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  token?: string;
  meta?:TMeta;
  data: T;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data?.statusCode).json({
    statusCode: data.statusCode,
    success: data?.success,
    message: data.message,
    token: data.token,
    meta: data.meta,
    data: data.data,
  });
};

export default sendResponse;