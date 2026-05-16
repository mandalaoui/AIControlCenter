import fs from "fs";
import path from "path";

import {
  buildTelemetry,
} from "@/lib/ingestion/build-telemetry";

/**
 * Generates normalized telemetry
 * from all registered providers.
 */
async function main() {
  const telemetry =
    await buildTelemetry();

  const outputPath = path.join(
    process.cwd(),
    "data",
    "generated",
    "usage-logs.generated.json",
  );

  fs.mkdirSync(
    path.dirname(outputPath),
    {
      recursive: true,
    },
  );

  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      telemetry,
      null,
      2,
    ),
  );

  console.log(
    `Generated ${telemetry.length} telemetry records`,
  );
}

main().catch((error) => {
  console.error(
    "Failed to generate telemetry",
    error,
  );

  process.exit(1);
});