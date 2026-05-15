import { ToolsDirectoryView } from "@/components/tools-directory/tools-directory-view";
import { computeAnalyticsData } from "@/lib/analytics";
import { getEnrichedToolsDirectory } from "@/lib/tools";

export default function ToolsDirectoryPage() {
  const analytics = computeAnalyticsData();
  const tools = getEnrichedToolsDirectory(analytics);

  return <ToolsDirectoryView tools={tools} />;
}
