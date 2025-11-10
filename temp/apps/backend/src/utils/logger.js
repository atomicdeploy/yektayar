function ts() {
  return new Date().toISOString();
}
const logger = {
  info: (msg, meta = {}) => console.log(`[${ts()}] [info] ${msg} ${JSON.stringify(meta)}`),
  warn: (msg, meta = {}) => console.warn(`[${ts()}] [warn] ${msg} ${JSON.stringify(meta)}`),
  error: (msg, meta = {}) => console.error(`[${ts()}] [error] ${msg} ${JSON.stringify(meta)}`)
};
module.exports = { logger };