import { PipelineTemplate } from "@prisma/client";
import { ASSET_TYPES } from "@/lib/investments/breakdown";
import { DEFAULT_CURRENCY, formatMoney, formatSalaryRange } from "@/lib/currencies";

type JobMetadata = {
  company?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryRange?: string;
};

type SalesMetadata = {
  company?: string;
  dealValue?: number;
  dealCurrency?: string;
  contactEmail?: string;
};

type GradMetadata = {
  institution?: string;
  program?: string;
  deadline?: string;
};

type InvestmentMetadata = {
  assetType?: string;
  ticker?: string;
  amountInvested?: number;
  currentValue?: number;
  currency?: string;
};

export type MetadataDisplayRow = {
  label: string;
  value: string;
  href?: string;
};

export type ItemHeroMetric = {
  label: string;
  value: string;
  fallback?: string;
};

export function getMetadataDisplayRows(
  template: PipelineTemplate,
  metadata: unknown,
): MetadataDisplayRow[] {
  if (!metadata || typeof metadata !== "object") return [];

  const rows: MetadataDisplayRow[] = [];

  switch (template) {
    case "JOB_SEARCH": {
      const m = metadata as JobMetadata;
      if (m.company) rows.push({ label: "Company", value: m.company });
      if (m.location) rows.push({ label: "Location", value: m.location });
      const salary =
        formatSalaryRange(
          m.salaryMin,
          m.salaryMax,
          m.salaryCurrency ?? DEFAULT_CURRENCY,
        ) ?? (m.salaryRange ? m.salaryRange : null);
      if (salary) rows.push({ label: "Salary", value: salary });
      break;
    }
    case "SALES": {
      const m = metadata as SalesMetadata;
      if (m.company) rows.push({ label: "Company", value: m.company });
      if (m.dealValue != null) {
        rows.push({
          label: "Deal value",
          value: formatMoney(m.dealValue, m.dealCurrency ?? DEFAULT_CURRENCY),
        });
      }
      if (m.contactEmail) {
        rows.push({
          label: "Contact",
          value: m.contactEmail,
          href: `mailto:${m.contactEmail}`,
        });
      }
      break;
    }
    case "GRAD_SCHOOL": {
      const m = metadata as GradMetadata;
      if (m.institution) rows.push({ label: "Institution", value: m.institution });
      if (m.program) rows.push({ label: "Program", value: m.program });
      if (m.deadline) rows.push({ label: "Deadline", value: m.deadline });
      break;
    }
    case "INVESTMENTS": {
      const m = metadata as InvestmentMetadata;
      const currency = m.currency ?? DEFAULT_CURRENCY;
      if (m.assetType) {
        const label = ASSET_TYPES.find((t) => t.value === m.assetType)?.label ?? m.assetType;
        rows.push({ label: "Asset type", value: label });
      }
      if (m.ticker) rows.push({ label: "Ticker", value: m.ticker });
      if (m.amountInvested != null) {
        rows.push({
          label: "Invested",
          value: formatMoney(m.amountInvested, currency),
        });
      }
      if (m.currentValue != null) {
        rows.push({
          label: "Current value",
          value: formatMoney(m.currentValue, currency),
        });
      }
      break;
    }
  }

  return rows;
}

export function getInvestmentDisplay(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as InvestmentMetadata;
  if (m.currentValue != null) {
    return formatMoney(m.currentValue, m.currency ?? DEFAULT_CURRENCY);
  }
  if (m.amountInvested != null) {
    return formatMoney(m.amountInvested, m.currency ?? DEFAULT_CURRENCY);
  }
  return null;
}

export function getSalaryDisplay(
  metadata: unknown,
  fallbackCurrency: string = DEFAULT_CURRENCY,
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as JobMetadata;
  return (
    formatSalaryRange(
      m.salaryMin,
      m.salaryMax,
      m.salaryCurrency ?? fallbackCurrency,
    ) ?? m.salaryRange ?? null
  );
}

export function getDealValueDisplay(
  metadata: unknown,
  fallbackCurrency: string = DEFAULT_CURRENCY,
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as SalesMetadata;
  if (m.dealValue == null) return null;
  return formatMoney(m.dealValue, m.dealCurrency ?? fallbackCurrency);
}

export function getDeadlineDisplay(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const m = metadata as GradMetadata;
  return m.deadline ?? null;
}

export function getItemHeroMetric(
  template: PipelineTemplate,
  metadata: unknown,
): ItemHeroMetric {
  switch (template) {
    case "JOB_SEARCH": {
      const value = getSalaryDisplay(metadata);
      return {
        label: "Salary",
        value: value ?? "—",
        fallback: "Add salary in details",
      };
    }
    case "SALES": {
      const value = getDealValueDisplay(metadata);
      return {
        label: "Deal value",
        value: value ?? "—",
        fallback: "Add deal value in details",
      };
    }
    case "GRAD_SCHOOL": {
      const value = getDeadlineDisplay(metadata);
      return {
        label: "Deadline",
        value: value ?? "—",
        fallback: "Add deadline in details",
      };
    }
    case "INVESTMENTS": {
      const value = getInvestmentDisplay(metadata);
      return {
        label: "Value",
        value: value ?? "—",
        fallback: "Add investment value in details",
      };
    }
    default:
      return { label: "Status", value: "—" };
  }
}
