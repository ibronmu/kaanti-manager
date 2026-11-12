export const openapiSpec = {
  openapi: "3.0.0",
  info: { title: "Kaanti Manager API", version: "1.0.0" },
  servers: [{ url: "http://localhost:4000/api/v1" }],
  paths: {
        "/financing": {
      get: { summary: "List financing products", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
    "/financing/structures": {
      get: { summary: "List available financing structures", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
    "/financing/{id}": {
      get: { summary: "Get a financing product", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
    },
    "/financing/{id}/interest": {
      post: { summary: "Express interest in a financing product", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "201": { description: "Created" } } },
    },
    "/investments": {
      get: { summary: "List investment products", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
    "/investments/{id}": {
      get: { summary: "Get an investment product", security: [{ bearerAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
    },
    "/education": {
      get: { summary: "List lessons", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
    },
    "/education/{slug}": {
      get: { summary: "Get a lesson by slug", security: [{ bearerAuth: [] }], parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
    },
    "/readiness/{businessId}": {
      get: { summary: "Get financial readiness summary", security: [{ bearerAuth: [] }], parameters: [{ name: "businessId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "OK" } } },
    },
    "/businesses/{businessId}/dashboard": {
  get: {
    summary: "Dashboard summary for a business",
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: "businessId", in: "path", required: true, schema: { type: "string" } },
      { name: "from", in: "query", schema: { type: "string", format: "date" } },
      { name: "to", in: "query", schema: { type: "string", format: "date" } },
    ],
    responses: { "200": { description: "OK" } },
  },
},
"/businesses/{businessId}/transactions": {
  get: { summary: "List transactions", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  post: { summary: "Create transaction", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
},
"/businesses/{businessId}/transactions/categories": {
  get: { summary: "List income + expense categories", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
},
"/businesses/{businessId}/transactions/{id}": {
  get: { summary: "Get transaction", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  patch: { summary: "Update transaction", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  delete: { summary: "Delete transaction", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
},
"/businesses/{businessId}/inventory": {
  get: { summary: "List inventory", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  post: { summary: "Create inventory item", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
},
"/businesses/{businessId}/inventory/{id}": {
  patch: { summary: "Update inventory item", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  delete: { summary: "Delete inventory item", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
},
"/businesses/{businessId}/customers": {
  get: { summary: "List customers", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  post: { summary: "Create customer", security: [{ bearerAuth: [] }], responses: { "201": { description: "Created" } } },
},
"/businesses/{businessId}/customers/{id}": {
  patch: { summary: "Update customer", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
  delete: { summary: "Delete customer", security: [{ bearerAuth: [] }], responses: { "200": { description: "OK" } } },
},
"/businesses/{businessId}/reports/transactions.csv": {
  get: {
    summary: "Download transactions CSV",
    security: [{ bearerAuth: [] }],
    parameters: [
      { name: "from", in: "query", required: true, schema: { type: "string", format: "date" } },
      { name: "to", in: "query", required: true, schema: { type: "string", format: "date" } },
    ],
    responses: { "200": { description: "CSV" } },
  },
},
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