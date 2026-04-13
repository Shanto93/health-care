import { NextFunction, Request, Response } from "express";

const notFound = (req: Request, res: Response, next: NextFunction) => {
  import("http-status").then((httpStatus) => {
    res.status(httpStatus.default.NOT_FOUND).json({
      success: false,
      message: "API NOT FOUND!",
      error: {
        path: req.originalUrl,
        message: "Your requested path is not found!",
      },
    });
  });
};

export default notFound;
