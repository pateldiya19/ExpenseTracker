const util = require('util');

// Lightweight request/response logger with duration and bodies (size-limited)
module.exports = function requestLogger(req, res, next) {
  const startHr = process.hrtime.bigint();
  const { method, originalUrl } = req;
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const requestBodyPreview = safePreview(req.body);
  console.log(`[REQ ${requestId}] ${method} ${originalUrl} body=${requestBodyPreview}`);

  const originalSend = res.send;
  let responseBodySize = 0;

  res.send = function patchedSend(body) {
    try {
      responseBodySize = getBodySize(body);
    } catch (_) {
      responseBodySize = 0;
    }
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const durationMs = Number((process.hrtime.bigint() - startHr) / 1000000n);
    console.log(
      `[RES ${requestId}] ${method} ${originalUrl} status=${res.statusCode} durationMs=${durationMs} respSize=${responseBodySize}`
    );
  });

  next();
};

function safePreview(obj) {
  try {
    if (!obj) return 'null';
    const text = typeof obj === 'string' ? obj : JSON.stringify(obj);
    return text.length > 500 ? text.slice(0, 500) + '…' : text;
  } catch (e) {
    return `<unserializable:${e && e.message}>`;
  }
}

function getBodySize(body) {
  if (body == null) return 0;
  if (Buffer.isBuffer(body)) return body.length;
  if (typeof body === 'string') return Buffer.byteLength(body);
  try {
    return Buffer.byteLength(JSON.stringify(body));
  } catch (_) {
    return 0;
  }
}


