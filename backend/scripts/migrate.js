const { Client } = require("pg");
const fs = require("node:fs");
const path = require("node:path");

async function migrate() {
  const config = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  };

  const client = new Client(config);

  try {
    console.log("=== Stashy Node-based Migration ===");
    console.log(`Target: ${config.host}:${config.port}/${config.database}`);

    let connected = false;
    for (let i = 0; i < 15; i++) {
      try {
        await client.connect();
        connected = true;
        break;
      } catch (_err) {
        console.log("Waiting for PostgreSQL to be ready...");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    if (!connected) throw new Error("Could not connect to database");

    await client.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        sequence_id INTEGER PRIMARY KEY,
        filename TEXT NOT NULL,
        executed_at TIMESTAMP DEFAULT NOW()
      );
    `);

    async function runMigrationsFromDir(dirPath) {
      if (!fs.existsSync(dirPath)) return;

      const { rows } = await client.query(
        "SELECT COALESCE(MAX(sequence_id), -1) as max_seq FROM migration_history",
      );
      let lastSeq = rows[0].max_seq;

      console.log(`Current sequence: ${lastSeq} (Checking ${dirPath})`);

      const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      for (const filename of files) {
        const fileSeq = parseInt(filename.split("_")[0], 10);
        if (Number.isNaN(fileSeq)) continue;

        if (fileSeq > lastSeq) {
          console.log(`  [RUN] Seq ${fileSeq}: ${filename}`);
          const sql = fs.readFileSync(path.join(dirPath, filename), "utf8");

          await client.query("BEGIN");
          try {
            await client.query(sql);
            await client.query(
              "INSERT INTO migration_history (sequence_id, filename) VALUES ($1, $2)",
              [fileSeq, filename],
            );
            await client.query("COMMIT");
            lastSeq = fileSeq;
          } catch (err) {
            await client.query("ROLLBACK");
            console.error(`Error in ${filename}:`, err.message);
            throw err;
          }
        }
      }
    }

    await runMigrationsFromDir("/app/backend/migrations");

    console.log("=== All migrations are up to date ===");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate().catch((reason) => {
  console.error(reason);
});
