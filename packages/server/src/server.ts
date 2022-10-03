require("dotenv").config();
import express, { ErrorRequestHandler } from "express";
import { connectMongoose } from "./mongoose";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { setupUserRoutes } from "./routes/user.routes";
import bodyParser from "body-parser";
import { ServerError } from "./utils/errors";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import debug from "debug";
import { setupHobbyRoutes } from "./routes/hobby.routes";
import cors from "cors";

const log = debug("main:");

const app = express();

app.use(cors({ origin: true }));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(bodyParser.json());
const bodyParserErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err && err.status === 400)
    return next(new ServerError(StatusCodes.BAD_REQUEST, "Bad JSON format"));
  next(err);
};
app.use(bodyParserErrorHandler);

setupUserRoutes(app);
setupHobbyRoutes(app);

const generalErrorHandler: ErrorRequestHandler = (error, _, res, __) => {
  log(error);
  if (error instanceof ServerError) return res.status(error.status).send(error);
  return res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      new ServerError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        ReasonPhrases.INTERNAL_SERVER_ERROR
      )
    );
};
app.use(generalErrorHandler);

app.use((req, res) => {
  res
    .status(StatusCodes.NOT_FOUND)
    .send(new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND));
});

connectMongoose(() => {
  app.listen(process.env.PORT, () =>
    log("app is listening on %d", process.env.PORT)
  );
});
