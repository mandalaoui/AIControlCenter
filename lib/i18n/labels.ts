import type { TFunction } from "i18next";

function entityKey(
  group: "teams" | "tools" | "models" | "users",
  name: string,
): string {
  return `entities.${group}.${name}`;
}

export function translateTeam(name: string, t: TFunction): string {
  return t(entityKey("teams", name), { defaultValue: name });
}

export function translateTool(name: string, t: TFunction): string {
  return t(entityKey("tools", name), { defaultValue: name });
}

export function translateModel(name: string, t: TFunction): string {
  return t(entityKey("models", name), { defaultValue: name });
}

export function translateUser(name: string, t: TFunction): string {
  return t(entityKey("users", name), { defaultValue: name });
}

export function translateEntity(name: string, t: TFunction): string {
  const team = translateTeam(name, t);
  if (team !== name) {
    return team;
  }
  const tool = translateTool(name, t);
  if (tool !== name) {
    return tool;
  }
  return translateModel(name, t);
}

const TEAM_PARAM_KEYS = [
  "team",
  "topTeam",
  "expandTeam",
  "lowTeam",
] as const;

const TOOL_PARAM_KEYS = ["topTool", "lowTool", "tool", "action"] as const;

export function localizeInsightParams(
  params: Record<string, unknown> | undefined,
  t: TFunction,
): Record<string, unknown> {
  if (!params) {
    return {};
  }

  const result: Record<string, unknown> = { ...params };

  for (const key of TEAM_PARAM_KEYS) {
    const value = result[key];
    if (typeof value === "string") {
      result[key] = translateTeam(value, t);
    }
  }

  for (const key of TOOL_PARAM_KEYS) {
    const value = result[key];
    if (typeof value === "string") {
      const translated = translateTool(value, t);
      if (translated !== value) {
        result[key] = translated;
      }
    }
  }

  return result;
}
