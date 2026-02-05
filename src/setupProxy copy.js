const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/trip-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/card-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/pay",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/escrow-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/cancel-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/member-api",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000",
      changeOrigin: true,
    })
  );
  app.use(
    "/auth",
    createProxyMiddleware({
      target: "http://127.0.0.1:5000/auth",
      changeOrigin: true,
    })
  );
};
