import fs from "fs";
import path from "path";

import { computeAnalyticsData, loadUsageLogs } from "@/lib/analytics";

const metrics = computeAnalyticsData(loadUsageLogs());

const outputPath = path.join(
  process.cwd(),
  "data",
  "generated",
  "metrics.generated.json",
);

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

fs.writeFileSync(
  outputPath,
  JSON.stringify(metrics, null, 2),
);

console.log(
  `Generated analytics metrics (${metrics.logs.length} logs, period: ${metrics.period})`,
);
