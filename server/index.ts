import { app } from "./app.js";
import { prisma } from "./db.js";
import { config } from "./config.js";

// Démarrage du serveur accessible depuis Render
const server = app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`API Océan Média TV : port ${config.PORT}`);
});

server.requestTimeout = 30_000;
server.headersTimeout = 35_000;

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
