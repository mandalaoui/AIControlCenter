import type { TFunction } from "i18next";

import {
  translateEntity,
  translateModel,
  translateTeam,
  translateTool,
} from "@/lib/i18n/labels";
import type {
  AIInsight,
  AITool,
  AnomalySummary,
  OptimizationRecommendation,
} from "@/lib/types";

export function localizeRecommendation(
  rec: OptimizationRecommendation,
  t: TFunction,
): OptimizationRecommendation {
  const base = `recommendations.${rec.id}`;
  const params = rec.i18nParams ?? {};
  const title = t(`${base}.title`, { defaultValue: rec.title, ...params });
  const description = t(`${base}.description`, {
    defaultValue: rec.description,
    ...params,
  });
  const evidence = t(`${base}.evidence`, {
    defaultValue: rec.evidence,
    ...params,
  });

  return { ...rec, title, description, evidence };
}

export function localizeAnomaly(
  anomaly: AnomalySummary,
  t: TFunction,
): AnomalySummary {
  if (!anomaly.id) {
    return {
      ...anomaly,
      affectedEntity: translateEntity(anomaly.affectedEntity, t),
    };
  }

  const base = `anomalies.${anomaly.id}`;
  const params = {
    ...anomaly.params,
    team: translateTeam(String(anomaly.params?.team ?? anomaly.affectedEntity), t),
    tool: translateTool(String(anomaly.params?.tool ?? anomaly.affectedEntity), t),
    week: anomaly.week,
  };
  return {
    ...anomaly,
    description: t(`${base}.description`, {
      defaultValue: anomaly.description,
      ...params,
    }),
    magnitude: t(`${base}.magnitude`, {
      defaultValue: anomaly.magnitude,
      ...params,
    }),
    affectedEntity: translateEntity(anomaly.affectedEntity, t),
  };
}

export function localizeInsight(insight: AIInsight, t: TFunction): AIInsight {
  if (!insight.id.startsWith("fallback-insight-")) {
    return {
      ...insight,
      affectedEntity: translateEntity(insight.affectedEntity, t),
    };
  }

  const key = insight.id.replace("fallback-insight-", "");
  const base = `fallbackInsights.${key}`;
  return {
    ...insight,
    title: t(`${base}.title`, {
      defaultValue: insight.title,
      entity: translateEntity(insight.affectedEntity, t),
    }),
    description: t(`${base}.description`, { defaultValue: insight.description }),
    whyThisMatters: t(`${base}.whyThisMatters`, {
      defaultValue: insight.whyThisMatters,
    }),
    recommendedAction: t(`${base}.action`, {
      defaultValue: insight.recommendedAction,
    }),
    affectedEntity: translateEntity(insight.affectedEntity, t),
  };
}

export function localizeToolContent(tool: AITool, t: TFunction): AITool {
  const base = `toolContent.${tool.id}`;
  const description = t(`${base}.description`, { defaultValue: tool.description });

  const strengths = tool.strengths.map((item, index) =>
    t(`${base}.strengths.${index}`, { defaultValue: item }),
  );
  const limitations = tool.limitations.map((item, index) =>
    t(`${base}.limitations.${index}`, { defaultValue: item }),
  );
  const notRecommendedFor = tool.notRecommendedFor.map((item, index) =>
    t(`${base}.notRecommendedFor.${index}`, { defaultValue: item }),
  );

  const pricing = tool.pricing.map((plan, index) => ({
    ...plan,
    name: t(`${base}.pricing.${index}.name`, { defaultValue: plan.name }),
    bestFor: plan.bestFor
      ? t(`${base}.pricing.${index}.bestFor`, { defaultValue: plan.bestFor })
      : plan.bestFor,
    includes: plan.includes.map((inc, i) =>
      t(`${base}.pricing.${index}.includes.${i}`, { defaultValue: inc }),
    ),
  }));

  const models = tool.models.map((model, mIndex) => ({
    ...model,
    displayName: t(`${base}.models.${mIndex}.displayName`, {
      defaultValue: model.displayName,
    }),
    strengths: model.strengths.map((s, i) =>
      t(`${base}.models.${mIndex}.strengths.${i}`, { defaultValue: s }),
    ),
    recommendedFor: model.recommendedFor.map((s, i) =>
      t(`${base}.models.${mIndex}.recommendedFor.${i}`, { defaultValue: s }),
    ),
    notRecommendedFor: model.notRecommendedFor.map((s, i) =>
      t(`${base}.models.${mIndex}.notRecommendedFor.${i}`, { defaultValue: s }),
    ),
  }));

  return {
    ...tool,
    description,
    strengths,
    limitations,
    notRecommendedFor,
    pricing,
    models,
  };
}
