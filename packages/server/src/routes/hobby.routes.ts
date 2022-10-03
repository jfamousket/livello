import { Application } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { isValidHobby } from "../guards/hobby.guards";
import { Hobby } from "../models/hobby.model";
import { ServerError } from "../utils/errors";
import { debug } from "debug";
import { has, pick, omit, without } from "lodash";
import { User } from "../models/user.model";
import { HobbyDefaults } from "../defaults/hobby.defaults";

const log = debug("hobby:");

export const setupHobbyRoutes = (app: Application) => {
  /**
   * @swagger
   * tags:
   *   name: Hobby
   *   description: Hobby CRUD Operations
   * components:
   *  schemas:
   *    Hobby:
   *      type: object
   *      properties:
   *        name:
   *          type: string
   *        passionLevel:
   *          type: number
   *          enum:
   *            - 0
   *            - 1
   *            - 2
   *            - 3
   *        year:
   *          type: number
   */

  /**
   * @swagger
   *
   * /hobbies:
   *      get:
   *        tags: [Hobby]
   *        summary: Get all hobbies
   *        responses:
   *          200:
   *            description: A list of hobbies.
   *            content:
   *              application/json:
   *                schema:
   *                  type: array
   *                  items:
   *                    $ref: '#/components/schemas/Hobby'
   */
  app.get("/hobbies", async (req, res, next) => {
    try {
      const hobby = await Hobby.find({});
      res.send(hobby);
    } catch (error) {
      return next(
        new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
      );
    }
  });

  /**
   * @swagger
   * /hobby/{hobbyId}:
   *      get:
   *        tags: [Hobby]
   *        summary: Fetch hobby based on hobby id
   *        parameters:
   *            - in: path
   *              name: hobbyId
   *              description: The Hobby Id
   *              required: true
   *              type: string
   *        responses:
   *            200:
   *              description: Hobby with requested id.
   *              content:
   *                application/json:
   *                    schema:
   *                        $ref: '#/components/schemas/Hobby'
   *
   */
  app.get("/hobby/:id", async (req, res, next) => {
    try {
      const hobby = await Hobby.findById(req.params.id);
      if (!hobby)
        next(new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND));
      res.send(pick(hobby, HobbyDefaults.resProps));
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
   * /hobby:
   *      post:
   *          tags: [Hobby]
   *          summary: Create a new hobby
   *          requestBody:
   *            content:
   *              application/json:
   *                schema:
   *                  allOf:
   *                    - $ref: '#/components/schemas/Hobby'
   *                    - type: object
   *                      properties:
   *                        userId:
   *                          type: string
   *          responses:
   *            200:
   *              description: Created Hobby.
   *              content:
   *                application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/Hobby'
   *
   */
  app.post("/hobby", async (req, res, next) => {
    try {
      if (
        !isValidHobby(req.body) &&
        !(has(req.body, "userId") && typeof req.body.userId === "string")
      )
        return next(
          new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        );
      const user = await User.findById(req.body.userId);
      if (!user)
        return next(new ServerError(StatusCodes.NOT_FOUND, "Invalid user id"));
      const hobby = new Hobby(req.body);
      hobby.id = hobby._id.toString();
      await hobby.save();
      await user.update({
        hobbies: user.hobbies.concat([hobby.id]),
      });
      res.send(pick(hobby, HobbyDefaults.resProps));
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
   * /hobby/{userId}/{hobbyId}:
   *      delete:
   *          tags: [Hobby]
   *          summary: Delete hobby based on hobby id
   *          parameters:
   *            - in: path
   *              name: hobbyId
   *              description: The Hobby Id to delete
   *              required: true
   *              type: string
   *            - in: path
   *              name: userId
   *              description: The User Id to remove the Hobby from
   *              required: true
   *              type: string
   *          responses:
   *            200:
   *              description: OK.
   */
  app.delete("/hobby/:userId/:id", async (req, res, next) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user)
        return next(new ServerError(StatusCodes.NOT_FOUND, "Invalid user id"));
      const hobby = await Hobby.findByIdAndDelete(req.params.id);
      if (!hobby)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      await user.update({
        hobbies: without(user.hobbies, hobby.id),
      });
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
   * /hobby/{hobbyId}:
   *      patch:
   *          tags: [Hobby]
   *          summary: Update hobby based on hobby id
   *          parameters:
   *            - in: path
   *              name: hobbyId
   *              description: The Hobby Id
   *              required: true
   *              type: string
   *          requestBody:
   *            content:
   *              application/json:
   *                schema:
   *                  $ref: '#/components/schemas/Hobby'
   *          responses:
   *            200:
   *              description: Hobby with updated values.
   *              content:
   *                application/json:
   *                  schema:
   *                    $ref: '#/components/schemas/Hobby'
   */
  app.patch("/hobby/:id", async (req, res, next) => {
    try {
      if (!isValidHobby(req.body, Object.keys(req.body) as any))
        return next(
          new ServerError(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST)
        );
      const hobby = await Hobby.findByIdAndUpdate(
        req.params.id,
        omit(req.body, "id"),
        {
          new: true,
        }
      );
      if (!hobby)
        return next(
          new ServerError(StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND)
        );
      await hobby.save();
      res.send(pick(hobby, HobbyDefaults.resProps));
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
