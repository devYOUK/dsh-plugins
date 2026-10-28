import Schema from '@deepseek-ai/schemastery';

/**
 * Settings namespace is the plugin row id ('chat-search'): the Client reads and
 * writes it through `ctx.configForms.get('chat-search')`.
 *
 * Every field must be `volatile()`: the settings service only serves entries
 * with a volatile form, and only volatile paths accept writes. A non-volatile
 * field makes the whole entry unconfigurable instead of read-only.
 */
const DEFAULTS = { transparencyPercent: 38, blurPx: 60, highlightPercent: 38 };

function numberField(def, min, max, description) {
  let field = Schema.number().default(def);
  if (typeof field.description === 'function') field = field.description(description);
  if (typeof field.min === 'function') field = field.min(min);
  if (typeof field.max === 'function') field = field.max(max);
  if (typeof field.volatile === 'function') field = field.volatile();
  return field;
}

let ConfigSchema;
try {
  ConfigSchema = Schema.object({
    transparencyPercent: numberField(DEFAULTS.transparencyPercent, 0, 100, '搜索条背景的透明度（%）；数值越大越透，0 为完全不透明'),
    blurPx: numberField(DEFAULTS.blurPx, 0, 120, '毛玻璃模糊半径（px）；0 表示不模糊'),
    highlightPercent: numberField(DEFAULTS.highlightPercent, 0, 100, '命中高亮的不透明度（%）；0 表示不高亮'),
  });
} catch (error) {
  ConfigSchema = Schema.object({
    transparencyPercent: Schema.number().default(DEFAULTS.transparencyPercent),
    blurPx: Schema.number().default(DEFAULTS.blurPx),
    highlightPercent: Schema.number().default(DEFAULTS.highlightPercent),
  });
}

export const Config = ConfigSchema;

/** Host half: the search UI lives in the client; this row only carries the settings schema. */
export function apply() {}
