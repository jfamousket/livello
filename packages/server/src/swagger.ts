import swagger from "swagger-jsdoc";

export const swaggerSpec = swagger({
  apis: ["**/*.ts"],
  definition: {
    openapi: "3.0.0",
    info: {
      title: "User Hobbies",
      version: "1.0.0",
      description: "Swagger API for simple User Hobbies Application"
    },
  },
});
