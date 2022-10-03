import { Application } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { ServerError } from "../utils/errors";
import { User } from "../models/user.model";
import debug from "debug";
import { isValidUser } from "../guards/user.guards";
import { Hobby } from "../models/hobby.model";
import { IHobby } from "../schemas/hobbies.schema";
import { pick, omit } from "lodash";
import { UserDefaults } from "../defaults/user.defaults";

const log = debug("user:");

export const setupUserRoutes = (app: Application) => {
  /**
   * @swagger
   * tags:
   *   name: User
   *   description: User CRUD Operations
   * components:
   *  schemas:
   *    User:
   *      type: object
   *      properties:
   *        name:
   *          type: string
   *        hobbies:
   *          type: array
   *          items:
   *            type: string
   */

  /**
   * @swagger
   *
   * /users:
   *      get:
   *        tags: [User]
   *        summary: Get all users
   *        responses:
   *          200:
   *            description: A list of users.
   *            content:
   *              application/json:
   *                schema:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/User'
   */
  app.get("/users", async (req, res, next) => {
    try {
      const users = await User.find({});
      res.send(users);
    } catch (error) {
      return next(
        new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      );
    }
  });

  /**
   * @swagger
   * /user/{userId}:
   *      get:
   *          tags: [User]
   *          summary: Fetch user based on user id
   *          parameters:
   *            - in: path
   *              name: userId
   *              description: The User Id
   *              required: true
   *              type: string
   *          responses:
   *            200:
   *              description: User with requested id.
   *              content:
   *                application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   */
  app.get("/user/:id", async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      res.send(pick(user, UserDefaults.resProps));
    } catch (error) {
      log(error);
      next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @swagger
   *
   * /user:
   *      post:
   *          tags: [User]
   *          summary: Create a new user
   *          requestBody:
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/User'
   *          responses:
   *            200:
   *              description: Created User.
   *              content:
   *                application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   *
   */
  app.post("/user", async (req, res, next) => {
    try {
      if (!isValidUser(req.body))
        return next(
          new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        );
      const user = new User(req.body);
      user.id = user._id.toString();
      await user.save();
      res.send(pick(user, UserDefaults.resProps));
    } catch (error) {
      log(error);
      next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @swagger
   *
   * /user/{userId}:
   *      delete:
   *          tags: [User]
   *          summary: Delete user based on user id
   *          parameters:
   *            - in: path
   *              name: userId
   *              description: The User Id
   *              required: true
   *              type: string
   *          responses:
   *            200:
   *              description: OK.
   */
  app.delete("/user/:id", async (req, res, next) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);

      if (!user)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      res.status(StatusCodes.OK).send(ReasonPhrases.OK);
    } catch (error) {
      log(error);
      next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @swagger
   *
   * /user/{userId}:
   *      patch:
   *          tags: [User]
   *          summary: Update user based on user id
   *          parameters:
   *            - in: path
   *              name: userId
   *              description: The User Id
   *              required: true
   *              type: string
   *          requestBody:
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/User'
   *          responses:
   *            200:
   *              description: User with updated values.
   *              content:
   *                application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/User'
   */
  app.patch("/user/:id", async (req, res, next) => {
    try {
      if (!isValidUser(req.body, Object.keys(req.body) as any))
        return next(
          new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        );
      const user = await User.findByIdAndUpdate(
        req.params.id,
        omit(req.body, ["id"]),
        {
          new: true,
        }
      );
      if (!user)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      await user.save();
      res.send(pick(user, UserDefaults.resProps));
    } catch (error) {
      log(error);
      next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR
        )
      );
    }
  });

  /**
   * @swagger
   *
   * /user/{userId}/hobbies:
   *      get:
   *          tags: [User]
   *          summary: Get user hobbies based on user id
   *          parameters:
   *            - in: path
   *              name: userId
   *              description: The User Id
   *              required: true
   *              type: string
   *          responses:
   *            200:
   *              description: A list of hobbies.
   *              content:
   *                application/json:
   *                  schema:
   *                    type: array
   *                    items:
   *                      $ref: '#/components/schemas/Hobby'
   */
  app.get("/user/:id/hobbies", async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      const hobbies: IHobby[] = [];
      await user.hobbies.reduce<Promise<unknown>>(
        (promise, cur) =>
          promise
            .then(() => Hobby.findById(cur))
            .then((hobby) => (hobby ? hobbies.push(hobby) : null)),
        Promise.resolve()
      );
      res.status(StatusCodes.OK).send(hobbies);
    } catch (error) {
      log(error);
      next(
        new ServerError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          ReasonPhrases.INTERNAL_SERVER_ERROR
        )
      );
    }
  });
};
