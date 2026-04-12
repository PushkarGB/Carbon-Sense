/**
 * Jest runs before specs import AppModule. Default to skipping BullMQ so tests
 * do not require Redis unless DISABLE_BULLMQ is explicitly set to "false".
 */
if (!process.env.DISABLE_BULLMQ) {
  process.env.DISABLE_BULLMQ = 'true';
}
