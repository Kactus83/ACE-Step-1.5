/**
 * @module task-variant-provenance
 * @remarks Normalize old ACE-Step cache fields without changing Python legacy clients.
 * @public
 */

/** @public Validated per-variant reproducibility and executed DiT metadata. */
export interface TaskVariantProvenance {
  readonly seed?: string;
  readonly ditModel?: string;
}

const VALID_SEED = /^[0-9]{1,16}$/;
const VALID_MODEL = /^[A-Za-z0-9_.:-]{1,160}$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

/**
 * @public Resolve old cache batch-wide comma-separated seed lists by audio index.
 * @remarks The old cache repeats the entire seed list and stores dit_model at the
 * top level. Store-derived results instead contain a per-variant seed and/or
 * metas.dit_model. Unknown or mismatched seed counts are never attributed.
 * @param items Untrusted /query_result decoded result records, in original order.
 * @returns One sanitized provenance record per item, without modifying inputs.
 */
export function taskVariantProvenance(
  items: readonly unknown[]
): readonly TaskVariantProvenance[] {
  const rows = items.map(record);
  const original = rows[0]?.["seed_value"];
  const combined = rows.length > 1 && typeof original === "string"
    && original.includes(",")
    && rows.every(row => row?.["seed_value"] === original);
  const pieces = combined ? (original as string).split(",") : [];
  const aligned = pieces.length === rows.length
    && pieces.every(value => VALID_SEED.test(value));

  return rows.map((row, index) => {
    const rawSeed = row?.["seed_value"];
    const seed = aligned ? pieces[index]
      : typeof rawSeed === "string" && VALID_SEED.test(rawSeed)
        ? rawSeed : undefined;
    const metadata = record(row?.["metas"]);
    const nested = metadata?.["dit_model"];
    const direct = row?.["dit_model"];
    const ditModel = typeof direct === "string" && VALID_MODEL.test(direct)
      ? direct : typeof nested === "string" && VALID_MODEL.test(nested)
        ? nested : undefined;
    return { ...(seed ? { seed } : {}), ...(ditModel ? { ditModel } : {}) };
  });
}
