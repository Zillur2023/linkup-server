import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./app/config";
import router from "./app/routes";
import globalErrorHandler from "./app/middleware/globalErrorhandler";
import notFound from "./app/middleware/notFound";


const app: Application = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: [config.client_url as string], credentials: true }));

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
