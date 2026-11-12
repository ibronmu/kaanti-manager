export const openapiSpec = {
  openapi: "3.0.0",
  info: { title: "Kaanti Manager API", version: "1.0.0" },
  servers: [{ url: "http://localhost:4000/api/v1" }],
  paths: {
    "/auth/register": {
      post: {
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "fullName"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                  fullName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" }, "409": { description: "Email exists" } },
      },
    },
    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: { email: { type: "string" }, password: { type: "string" } },
              },
            },
          },
        },
        responses: { "200": { description: "OK" }, "401": { description: "Invalid credentials" } },
      },
    },
    "/auth/refresh": { post: { summary: "Refresh access token", responses: { "200": { description: "OK" } } } },
    "/auth/logout": { post: { summary: "Logout", responses: { "200": { description: "OK" } } } },
    "/businesses": {
      get: { summary: "List my businesses", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
      post: {
        summary: "Create business (onboarding)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "category", "type", "location", "phone"],
                properties: {
                  name: { type: "string" }, category: { type: "string" }, type: { type: "string" },
                  location: { type: "string" }, phone: { type: "string" },
                  preferredLanguage: { type: "string", enum: ["en", "ha"] },
                  currency: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/businesses/{businessId}": {
      get: { summary: "Get business", security: [{ bearerAuth: [] }], parameters: [{ name: "businessId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
      patch: { summary: "Update business", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
  },
  components: {
    securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } },
  },
};