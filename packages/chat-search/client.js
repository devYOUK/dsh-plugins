window.__ModuleLoader__.load({
  id: '@local/dsh-chat-search',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useCallback } = React;

    const STORE_KEY = 'dsh-chat-search:history';
    const MAX_HISTORY = 20;
    const MAX_HITS = 400;
    const MAX_RECTS = 400;

    const CSS = [
      '.cs-trigger{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer}',
      '.cs-trigger:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.cs-bar{position:fixed;z-index:1200;display:flex;align-items:center;gap:2px;padding:3px 6px;border-radius:10px;background:color-mix(in srgb,var(--dsw-specific-menu,#f8f9fa) var(--cs-tint,62%),transparent);backdrop-filter:blur(var(--cs-blur,60px)) saturate(180%);border:.5px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-elevation-prominent),inset 0 1px 0 rgba(255,255,255,.45);font-size:12px;line-height:18px;color:var(--dsw-alias-label-primary)}',
      '.cs-btn{width:24px;height:24px;display:grid;place-items:center;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;font-size:11px;font-family:inherit;flex:none}',
      '.cs-btn-wide{width:auto;padding:0 6px;white-space:nowrap}',
      '.cs-btn:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.cs-btn[data-active="true"]{background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 16%,transparent);color:var(--dsw-alias-state-business-primary)}',
      '.cs-input{border:none;outline:none;background:transparent;resize:none;font:inherit;font-size:12px;line-height:18px;color:inherit;width:190px;max-height:54px;padding:0 4px;overflow-y:auto}',
      '.cs-input::placeholder{color:var(--dsw-alias-label-tertiary)}',
      '.cs-count{min-width:46px;text-align:center;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none}',
      '.cs-history{position:absolute;top:34px;left:6px;min-width:190px;max-height:260px;overflow:auto;padding:4px;background:color-mix(in srgb,var(--dsw-specific-menu,#f8f9fa) var(--cs-tint,62%),transparent);backdrop-filter:blur(var(--cs-blur,60px)) saturate(180%);border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;box-shadow:var(--dsw-elevation-prominent);z-index:1201}',
      '.cs-history-item{display:block;width:100%;text-align:left;padding:4px 8px;border:none;background:transparent;border-radius:6px;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.cs-history-item:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.cs-layer{position:fixed;inset:0;pointer-events:none;z-index:1}',
      '.cs-hit{position:absolute;border-radius:2px;background:color-mix(in srgb,#ffc400 var(--cs-hit,38%),transparent)}',
      '.cs-hit[data-current="true"]{background:color-mix(in srgb,#ff8c00 var(--cs-hit-current,61%),transparent)}',
      '.cs-cfg-form{display:flex;flex-direction:column}',
      '.cs-cfg-note{margin:0 0 12px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}',
      '.cs-cfg-field{display:flex;flex-direction:column;gap:6px;padding:12px 0}',
      '.cs-cfg-field+.cs-cfg-field{border-top:.5px solid var(--dsw-alias-border-l2)}',
      '.cs-cfg-head{display:flex;align-items:center;gap:8px}',
      '.cs-cfg-label{flex:1;min-width:0;font-size:13px;font-weight:500;line-height:1.5;color:var(--dsw-alias-label-primary)}',
      '.cs-cfg-badges{display:inline-flex;align-items:center;gap:8px}',
      '.cs-cfg-tag{display:inline-flex;align-items:center;border-radius:999px;padding:1px 8px;font-size:11px;line-height:17px;font-weight:500;white-space:nowrap;background:var(--dsw-alias-bg-module-platform,var(--dsw-alias-bg-layer-2));color:var(--dsw-alias-label-secondary)}',
      '.cs-cfg-reset{border:none;background:none;padding:0;font:inherit;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);cursor:pointer}',
      '.cs-cfg-reset:hover:not(:disabled){color:var(--dsw-alias-label-primary)}',
      '.cs-cfg-reset:disabled{cursor:default}',
      '.cs-cfg-input{height:34px;padding:0 12px;border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-3);font:inherit;font-size:13px;line-height:1.5;color:var(--dsw-alias-label-primary)}',
      '.cs-cfg-input:focus-visible{outline:none;border-color:var(--dsw-alias-state-business-primary)}',
      '.cs-cfg-input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}',
      '.cs-cfg-input[aria-invalid="true"]{border-color:var(--dsw-alias-state-error-primary)}',
      '.cs-cfg-invalid{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}',
      '.cs-cfg-hint{margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-tertiary)}',
      '.cs-cfg-switch{position:relative;flex:none;width:34px;height:18px;padding:0;border:none;border-radius:999px;background:var(--dsw-alias-bg-layer-4);cursor:pointer;transition:background-color .12s ease-out}',
      '.cs-cfg-switch[aria-checked="true"]{background:var(--dsw-alias-state-business-primary)}',
      '.cs-cfg-switch:disabled{opacity:.4;cursor:default}',
      '.cs-cfg-switch:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.cs-cfg-switch-thumb{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:999px;background:var(--dsw-alias-bg-base);box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .12s ease-out}',
      '.cs-cfg-switch[aria-checked="true"] .cs-cfg-switch-thumb{transform:translateX(16px)}',
      '.cs-cfg-footer{display:flex;align-items:center;gap:8px;padding-top:16px}',
      '.cs-cfg-failed{flex:1;min-width:0;margin:0;font-size:12px;line-height:1.5;color:var(--dsw-alias-state-error-primary)}',
      '.cs-cfg-save{appearance:none;border:1px solid transparent;border-radius:var(--dsw-radius-md);padding:5px 14px;font:inherit;font-size:13px;line-height:1.5;cursor:pointer;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}',
      '.cs-cfg-save:disabled{opacity:.4;cursor:default}',
      '.cs-cfg-save:focus-visible{outline:var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:1px}',
    ].join('');

    function ensureStyle() {
      if (document.querySelector('style[data-chat-search]') !== null) return;
      const style = document.createElement('style');
      style.setAttribute('data-chat-search', '1');
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    function loadHistory() {
      try {
        const raw = window.localStorage.getItem(STORE_KEY);
        const parsed = raw === null ? [] : JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string' && item !== '').slice(0, MAX_HISTORY) : [];
      } catch (error) {
        return [];
      }
    }

    function saveHistory(list) {
      try {
        window.localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
      } catch (error) {}
    }

    function buildMatcher(query, opts) {
      if (query === '') return null;
      let source = opts.regex ? query : query.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&');
      if (opts.wholeWord) source = '(?<![\\p{L}\\p{N}_])(?:' + source + ')(?![\\p{L}\\p{N}_])';
      try {
        return { re: new RegExp(source, opts.caseSensitive ? 'gu' : 'giu') };
      } catch (error) {
        return { error: String(error && error.message || error) };
      }
    }

    /** A folded process keeps its text in the DOM behind `hidden="until-found"`. */
    function isFolded(el) {
      return el.hasAttribute('hidden') || el.closest('[hidden]') !== null;
    }

    function nextFrame() {
      return new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
      });
    }

    /**
     * Ask the host to unfold a hidden row. The transcript hides process rows with
     * `hidden="until-found"` and listens for `beforematch` to set the process open,
     * so dispatching that event is the supported way to reveal one.
     */
    async function revealContainer(container) {
      if (container === null || !container.isConnected) return false;
      if (!isFolded(container)) return true;
      let target = container;
      while (target !== null && !target.hasAttribute('hidden')) target = target.parentElement;
      const element = target === null ? container : target;
      try {
        element.dispatchEvent(new Event('beforematch', { bubbles: false }));
      } catch (error) {
        return false;
      }
      const started = performance.now();
      while (performance.now() - started < 600) {
        await nextFrame();
        if (!isFolded(container) && container.dataset.chatMotion === undefined) {
          await nextFrame();
          return true;
        }
      }
      return !isFolded(container);
    }

    /**
     * Assistant prose is the `assistant-step` flow kind: `response` carries the
     * interim narration and the final answer, `reasoning` is the folded 思考
     * stream. A response marked as a turn-process member is interim narration, so
     * it follows the 过程 scope; hidden members additionally need the folded-process
     * setting before they are collected (they can be revealed with `beforematch`).
     */
    function classifyContainer(el, scope) {
      const kind = el.getAttribute('data-chat-flow-kind');
      const folded = isFolded(el);
      if (el.hasAttribute('data-turn-process-answer')) return folded ? null : { hidden: false };
      if (kind === 'user' || kind === 'steering') return folded ? null : { hidden: false };
      if (kind !== 'assistant-step') return null;
      if (el.getAttribute('data-chat-group-part') === 'reasoning') return null;
      if (!el.hasAttribute('data-turn-process-member')) return folded ? null : { hidden: false };
      if (scope.includeProcess !== true) return null;
      if (!folded) return { hidden: false };
      return scope.searchFoldedProcess === true ? { hidden: true } : null;
    }

    function collectMatches(root, re, scope) {
      const out = [];
      if (root === null) return out;
      const containers = root.querySelectorAll('[data-chat-flow-kind], [data-turn-process-answer]');
      const seen = new Set();
      for (let ci = 0; ci < containers.length; ci += 1) {
        const container = containers[ci];
        const classification = classifyContainer(container, scope);
        if (classification === null) continue;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
        let node = walker.nextNode();
        while (node !== null) {
          if (out.length >= MAX_HITS) return out;
          const text = node.nodeValue;
          const parent = node.parentElement;
          if (text && text.trim() !== '' && !seen.has(node) && parent !== null && parent.closest('script,style,noscript,.cs-bar,.cs-layer') === null) {
            seen.add(node);
            re.lastIndex = 0;
            let match = re.exec(text);
            while (match !== null) {
              if (match[0].length === 0) {
                re.lastIndex += 1;
              } else {
                out.push({ node: node, start: match.index, end: match.index + match[0].length, container: container, hidden: classification.hidden });
                if (out.length >= MAX_HITS) return out;
              }
              match = re.exec(text);
            }
          }
          node = walker.nextNode();
        }
      }
      return out;
    }

    /** Measure the visible hits; the layer sits below the composer, so no island math is needed. */
    function measureHits(matches, current) {
      const out = [];
      const flow = document.querySelector('[data-chat-flow]');
      const scroller = flow === null ? null : findScroller(flow);
      const clip = scroller === null ? null : scroller.getBoundingClientRect();
      for (let i = 0; i < matches.length; i += 1) {
        const match = matches[i];
        if (!match.node.isConnected) continue;
        const range = document.createRange();
        try {
          range.setStart(match.node, match.start);
          range.setEnd(match.node, match.end);
        } catch (error) {
          continue;
        }
        const list = range.getClientRects();
        for (let j = 0; j < list.length; j += 1) {
          const rect = list[j];
          if (rect.width < 1 || rect.height < 1) continue;
          if (clip !== null && (rect.bottom <= clip.top || rect.top >= clip.bottom)) continue;
          out.push({ left: rect.left, top: rect.top, width: rect.width, height: rect.height, current: i === current });
          if (out.length >= 400) return out;
        }
      }
      return out;
    }

    function findScroller(el) {
      let node = el;
      while (node !== null && node !== document.body) {
        const style = window.getComputedStyle(node);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight + 4) return node;
        node = node.parentElement;
      }
      return null;
    }

    function scrollToMatch(match) {
      try {
        const range = document.createRange();
        range.setStart(match.node, match.start);
        range.setEnd(match.node, match.end);
        const rect = range.getBoundingClientRect();
        const scroller = findScroller(match.node.parentElement);
        if (scroller === null) {
          match.node.parentElement.scrollIntoView({ block: 'center' });
          return;
        }
        const base = scroller.getBoundingClientRect();
        const target = scroller.scrollTop + (rect.top - base.top) - scroller.clientHeight / 2 + rect.height / 2;
        scroller.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      } catch (error) {}
    }

    const CONFIG_NS = 'chat-search';
    const CONFIG_DEFAULTS = { transparencyPercent: 38, blurPx: 60, highlightPercent: 38, searchFoldedProcess: false };

    /** The configure page's fields: label, hint and the value the stylesheet expects. */
    const STYLE_FIELDS = [
      { key: 'transparencyPercent', kind: 'number', label: '透明度（%）', hint: '搜索条背景有多透；0 为完全不透明，100 为完全透明。', placeholder: '38' },
      { key: 'blurPx', kind: 'number', label: '毛玻璃模糊（px）', hint: '背景模糊半径，取值 0–120；0 表示不模糊，数值越大越接近磨砂玻璃。', placeholder: '60' },
      { key: 'highlightPercent', kind: 'number', label: '命中高亮强度（%）', hint: '命中文字上高亮块的不透明度，取值 0–100；0 表示不高亮。', placeholder: '38' },
    ];

    /** Everything the configure page renders; the first three also drive the bar's CSS. */
    const CONFIG_FIELDS = [
      ...STYLE_FIELDS,
      {
        key: 'searchFoldedProcess',
        kind: 'boolean',
        label: '折叠过程正文',
        hint: '开启后，折叠起来的过程说明也参与搜索；定位到其中的命中时自动展开所在分组。关闭时与之前完全一致。',
      },
    ];

    function numberSpec(field) {
      return {
        key: field.key,
        format: (value) => (typeof value === 'number' ? String(value) : ''),
        parse: (text) => {
          const trimmed = text.trim();
          if (trimmed === '') return { kind: 'clear' };
          const value = Number(trimmed);
          return Number.isFinite(value) ? { kind: 'set', value: value } : undefined;
        },
      };
    }

    function booleanSpec(field) {
      return {
        key: field.key,
        format: (value) => (value === true ? 'true' : 'false'),
        parse: (text) => {
          if (text === 'true') return { kind: 'set', value: true };
          if (text === 'false') return { kind: 'set', value: false };
          return undefined;
        },
      };
    }

    function specFor(field) {
      return field.kind === 'boolean' ? booleanSpec(field) : numberSpec(field);
    }

    function objectOrNull(value) {
      return value !== null && typeof value === 'object' ? value : null;
    }

    /**
     * Staged form over the shared Host config of this row. Edits stay local until
     * save, reset stages a clear, and the write is fenced by the revision seen
     * when editing started — the same contract as the host settings form.
     */
    class SettingsModel {
      constructor(form, fields) {
        this.form = form;
        this.specs = new Map(fields.map((field) => [field.key, specFor(field)]));
        this.staged = new Map();
        this.listeners = new Set();
        this.baseline = undefined;
        this.saving = false;
        this.failed = false;
        this.unsubscribe = form.subscribe(() => this.publish());
      }

      snapshot() {
        return this.form.getSnapshot();
      }

      subscribe(listener) {
        this.listeners.add(listener);
        return () => {
          this.listeners.delete(listener);
        };
      }

      publish() {
        for (const listener of Array.from(this.listeners)) listener();
      }

      stored(key) {
        const user = objectOrNull(this.snapshot().user);
        return user !== null && Object.prototype.hasOwnProperty.call(user, key);
      }

      shell() {
        const snapshot = this.snapshot();
        const plan = this.plan();
        return {
          available: snapshot.status === 'ready',
          writable: snapshot.writable !== false,
          dirty: plan.length > 0,
          invalid: plan.some((entry) => entry.op === undefined),
          saving: this.saving,
          failed: this.failed,
        };
      }

      field(key) {
        const spec = this.specs.get(key);
        const staged = this.staged.get(key);
        if (staged === undefined) {
          const value = objectOrNull(this.snapshot().value);
          return { text: spec.format(value === null ? undefined : value[key]), overridden: this.stored(key), invalid: false };
        }
        const parsed = staged.clear ? { kind: 'clear' } : spec.parse(staged.text);
        return { text: staged.text, overridden: parsed !== undefined && parsed.kind === 'set', invalid: parsed === undefined };
      }

      edit(key, text) {
        this.stage(key, { text: text, clear: false });
      }

      resetField(key) {
        const base = objectOrNull(this.snapshot().base);
        const text = this.specs.get(key).format(base === null ? undefined : base[key]);
        this.stage(key, { text: text, clear: true });
      }

      stage(key, value) {
        if (this.baseline === undefined) this.baseline = this.snapshot();
        this.staged.set(key, value);
        this.failed = false;
        this.publish();
      }

      discard() {
        if (this.staged.size === 0 && !this.failed) return;
        this.staged.clear();
        this.baseline = undefined;
        this.failed = false;
        this.publish();
      }

      plan() {
        const out = [];
        const value = objectOrNull(this.snapshot().value);
        for (const [key, staged] of this.staged) {
          const spec = this.specs.get(key);
          if (staged.clear) {
            if (this.stored(key)) out.push({ key: key, op: { op: 'unset', path: [key] } });
            continue;
          }
          if (staged.text === spec.format(value === null ? undefined : value[key])) continue;
          const parsed = spec.parse(staged.text);
          if (parsed === undefined) out.push({ key: key });
          else if (parsed.kind === 'clear') out.push({ key: key, op: { op: 'unset', path: [key] } });
          else out.push({ key: key, op: { op: 'set', path: [key], value: parsed.value } });
        }
        return out;
      }

      async save() {
        const plan = this.plan();
        if (plan.length === 0 || this.saving || this.snapshot().writable === false || plan.some((entry) => entry.op === undefined)) return;
        this.saving = true;
        this.failed = false;
        this.publish();
        try {
          const ops = plan.flatMap((entry) => (entry.op === undefined ? [] : [entry.op]));
          const revision = this.baseline === undefined ? undefined : this.baseline.revision;
          const accepted = ops.length === 0 ? true : await this.form.mutate(ops, revision);
          if (!accepted) {
            this.failed = true;
            return;
          }
          this.staged.clear();
          this.baseline = undefined;
          this.failed = false;
        } catch (error) {
          this.failed = true;
        } finally {
          this.saving = false;
          this.publish();
        }
      }

      dispose() {
        this.unsubscribe();
        this.listeners.clear();
      }
    }

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    /** Fold the accepted values into the CSS variables the search bar reads. */
    function readStyle(model) {
      let value = null;
      try {
        const snapshot = model.form.getSnapshot();
        if (snapshot.status === 'ready') value = objectOrNull(snapshot.value);
      } catch (error) {}
      const number = (key) => {
        const raw = value === null ? undefined : value[key];
        return typeof raw === 'number' && Number.isFinite(raw) ? raw : CONFIG_DEFAULTS[key];
      };
      const transparency = clamp(number('transparencyPercent'), 0, 100);
      const blur = clamp(number('blurPx'), 0, 120);
      const hit = clamp(number('highlightPercent'), 0, 100);
      return {
        tint: 100 - transparency,
        blur: blur,
        hit: hit,
        hitCurrent: Math.min(100, Math.round(hit * 1.6)),
      };
    }

    /** Whether folded process prose joins the search (configure page, off by default). */
    function readFolded(model) {
      try {
        const snapshot = model.form.getSnapshot();
        if (snapshot.status !== 'ready') return false;
        const value = objectOrNull(snapshot.value);
        return value !== null && value.searchFoldedProcess === true;
      } catch (error) {
        return false;
      }
    }

    function IconSearch({ size = 14 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', 'aria-hidden': true },
        h('circle', { cx: 7, cy: 7, r: 4.5 }),
        h('path', { d: 'M10.5 10.5L14 14' }));
    }

    function IconCornerDownLeft() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: 'M12.5 3v5a2 2 0 0 1-2 2H4' }),
        h('path', { d: 'M6.5 7.5L4 10l2.5 2.5' }));
    }

    function IconChevron({ up }) {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: up ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4' }));
    }

    function IconClose() {
      return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', 'aria-hidden': true },
        h('path', { d: 'M4 4l8 8M12 4l-8 8' }));
    }

    function SearchBar({ model, onClose }) {
      const [query, setQuery] = useState('');
      const [opts, setOpts] = useState({ caseSensitive: false, wholeWord: false, regex: false, includeProcess: true });
      const [matches, setMatches] = useState([]);
      const [current, setCurrent] = useState(0);
      const [pos, setPos] = useState({ left: 24, top: 72 });
      const [rects, setRects] = useState([]);
      const [tick, setTick] = useState(0);
      const [history, setHistory] = useState(loadHistory);
      const [historyOpen, setHistoryOpen] = useState(false);
      const [style, setStyle] = useState(() => readStyle(model));
      const [folded, setFolded] = useState(() => readFolded(model));
      const [error, setError] = useState(null);
      const inputRef = useRef(null);
      const barRef = useRef(null);
      const deadRef = useRef(new Set());
      const generationRef = useRef(0);
      const [, forceRender] = useState(0);

      useEffect(() => {
        const sync = () => {
          setStyle(readStyle(model));
          setFolded(readFolded(model));
        };
        sync();
        return model.form.subscribe(sync);
      }, [model]);

      const remember = useCallback((value) => {
        if (value.trim() === '') return;
        setHistory((prev) => {
          const next = [value].concat(prev.filter((item) => item !== value)).slice(0, MAX_HISTORY);
          saveHistory(next);
          return next;
        });
      }, []);

      /**
       * Walk from a match, unfolding folded prose before measuring it. Matches the
       * host refuses to unfold are dropped from the count so navigation never lands
       * on an invisible hit.
       */
      const activate = useCallback(async (start, list, delta) => {
        const total = list.length;
        if (total === 0) return;
        const generation = generationRef.current;
        let index = start;
        for (let step = 0; step < total; step += 1) {
          const match = list[index];
          if (!deadRef.current.has(match)) {
            const revealed = match.hidden === true ? await revealContainer(match.container) : true;
            if (generationRef.current !== generation) return;
            if (revealed) {
              setCurrent(index);
              setTick((value) => value + 1);
              scrollToMatch(match);
              return;
            }
            deadRef.current.add(match);
            forceRender((value) => value + 1);
          }
          index = (index + delta + total) % total;
        }
      }, []);

      const runSearch = useCallback((navigate) => {
        generationRef.current += 1;
        const root = document.querySelector('[data-conversation-scroll]');
        const matcher = buildMatcher(query, opts);
        if (matcher === null) {
          setMatches([]);
          setCurrent(0);
          setError(null);
          return;
        }
        if (matcher.error !== undefined) {
          setMatches([]);
          setError('正则无效');
          return;
        }
        setError(null);
        const found = collectMatches(root, matcher.re, { includeProcess: opts.includeProcess === true, searchFoldedProcess: folded });
        deadRef.current = new Set();
        setMatches(found);
        // Only a new query navigates. A DOM-driven re-search (streaming, paging,
        // scroll chrome) must keep the reader where they are.
        if (navigate === true) {
          setCurrent(0);
          if (found.length > 0) activate(0, found, 1);
        } else {
          setCurrent((value) => (found.length === 0 ? 0 : Math.min(value, found.length - 1)));
        }
      }, [query, opts, folded, activate]);

      useEffect(() => {
        const timer = setTimeout(() => runSearch(true), 120);
        return () => clearTimeout(timer);
      }, [runSearch]);

      useEffect(() => {
        if (!historyOpen) return;
        const onPointerDown = (event) => {
          if (barRef.current !== null && !barRef.current.contains(event.target)) setHistoryOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
      }, [historyOpen]);

      // 2) Escape closes the dropdown first, then the bar, wherever focus is
      useEffect(() => {
        const onKey = (event) => {
          if (event.key !== 'Escape') return;
          event.preventDefault();
          if (historyOpen) {
            setHistoryOpen(false);
            return;
          }
          onClose();
        };
        document.addEventListener('keydown', onKey, true);
        return () => document.removeEventListener('keydown', onKey, true);
      }, [historyOpen, onClose]);

      useEffect(() => {
        const place = () => {
          const root = document.querySelector('[data-conversation-scroll]') || document.querySelector('[data-chat-flow]');
          if (root === null) return;
          const box = root.getBoundingClientRect();
          setPos({ left: Math.round(box.left + 12), top: Math.round(box.top + 8) });
        };
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
      }, []);

      useEffect(() => {
        if (matches.length === 0) {
          setRects([]);
          return;
        }
        setRects(measureHits(matches, current));
      }, [matches, current, tick]);

      useEffect(() => {
        let queued = 0;
        const onScroll = () => {
          if (queued !== 0) return;
          queued = window.requestAnimationFrame(() => {
            queued = 0;
            setTick((value) => value + 1);
          });
        };
        window.addEventListener('scroll', onScroll, true);
        return () => {
          window.removeEventListener('scroll', onScroll, true);
          if (queued !== 0) window.cancelAnimationFrame(queued);
        };
      }, []);

      useEffect(() => {
        const root = document.querySelector('[data-conversation-scroll]');
        let observer = null;
        let timer = null;
        if (root !== null) {
          observer = new MutationObserver(() => {
            clearTimeout(timer);
            timer = setTimeout(() => runSearch(false), 300);
          });
          observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] });
        }
        return () => {
          if (observer !== null) observer.disconnect();
          clearTimeout(timer);
        };
      }, [runSearch]);

      useEffect(() => {
        const el = inputRef.current;
        if (el !== null) {
          el.style.height = 'auto';
          el.style.height = Math.min(54, el.scrollHeight) + 'px';
        }
      }, [query]);

      useEffect(() => {
        const el = inputRef.current;
        if (el !== null) el.focus();
      }, []);

      const go = useCallback((delta) => {
        if (matches.length === 0) return;
        const next = (current + delta + matches.length) % matches.length;
        activate(next, matches, delta);
      }, [matches, current, activate]);

      const insertNewline = () => {
        const el = inputRef.current;
        if (el === null) {
          setQuery((value) => value + '\n');
          return;
        }
        const start = el.selectionStart === null ? query.length : el.selectionStart;
        const end = el.selectionEnd === null ? start : el.selectionEnd;
        const next = query.slice(0, start) + '\n' + query.slice(end);
        setQuery(next);
        window.requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + 1, start + 1);
        });
      };

      const onKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          remember(query);
          go(1);
        } else if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          go(-1);
        }
      };

      const toggle = (label, title, active, flip, wide) => h('button', {
        type: 'button',
        className: wide ? 'cs-btn cs-btn-wide' : 'cs-btn',
        title: title,
        'aria-pressed': active ? 'true' : 'false',
        'data-active': active ? 'true' : 'false',
        onMouseDown: (event) => event.preventDefault(),
        onClick: flip,
      }, label);

      const dead = deadRef.current;
      let aliveCount = 0;
      let currentRank = 0;
      for (let index = 0; index < matches.length; index += 1) {
        if (dead.has(matches[index])) continue;
        aliveCount += 1;
        if (index <= current) currentRank += 1;
      }
      const counter = aliveCount === 0 ? '0/0' : String(Math.max(1, currentRank)) + '/' + String(aliveCount);

      return h(React.Fragment, null,
        h('div', { ref: barRef, className: 'cs-bar', style: { left: pos.left, top: pos.top, '--cs-tint': String(style.tint) + '%', '--cs-blur': String(style.blur) + 'px', '--cs-hit': String(style.hit) + '%', '--cs-hit-current': String(style.hitCurrent) + '%' }, role: 'search' },
          h('button', { type: 'button', className: 'cs-btn', title: '搜索历史', onClick: () => setHistoryOpen((value) => !value) }, h(IconSearch, null)),
          historyOpen && history.length > 0 ? h('div', { className: 'cs-history' },
            history.map((item, index) => h('button', {
              key: index,
              type: 'button',
              className: 'cs-history-item',
              onClick: () => { setQuery(item); setHistoryOpen(false); },
            }, item))) : null,
          h('textarea', {
            ref: inputRef,
            className: 'cs-input',
            rows: 1,
            value: query,
            placeholder: error === null ? '搜索对话正文' : error,
            onChange: (event) => {
              setQuery(event.target.value);
              if (historyOpen) setHistoryOpen(false);
            },
            onKeyDown: onKeyDown,
          }),
          h('button', { type: 'button', className: 'cs-btn', title: '插入换行', onMouseDown: (event) => event.preventDefault(), onClick: insertNewline }, h(IconCornerDownLeft, null)),
          toggle('Aa', '区分大小写', opts.caseSensitive, () => setOpts((value) => ({ ...value, caseSensitive: !value.caseSensitive }))),
          toggle('W', '全词匹配', opts.wholeWord, () => setOpts((value) => ({ ...value, wholeWord: !value.wholeWord }))),
          toggle('.*', '正则匹配', opts.regex, () => setOpts((value) => ({ ...value, regex: !value.regex }))),
          toggle('过程', '包含过程说明；折叠部分是否参与并自动展开由插件配置决定', opts.includeProcess, () => setOpts((value) => ({ ...value, includeProcess: !value.includeProcess })), true),
          h('span', { className: 'cs-count' }, counter),
          h('button', { type: 'button', className: 'cs-btn', title: '上一个 (Shift+Enter)', onClick: () => go(-1) }, h(IconChevron, { up: true })),
          h('button', { type: 'button', className: 'cs-btn', title: '下一个 (Enter)', onClick: () => go(1) }, h(IconChevron, { up: false })),
          h('button', { type: 'button', className: 'cs-btn', title: '关闭 (Esc)', onClick: onClose }, h(IconClose, null))),
        h('div', { className: 'cs-layer' },
          rects.map((rect, index) => h('div', {
            key: index,
            className: 'cs-hit',
            'data-current': rect.current ? 'true' : 'false',
            style: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          }))));
    }

    /** One labelled field: a number input, or a switch for boolean settings. */
    function ConfigField({ model, spec, disabled }) {
      const state = model.field(spec.key);
      const id = 'chat-search-' + spec.key;
      const messageId = id + '-message';
      const overridden = state.overridden ? h('span', { className: 'cs-cfg-badges' },
        h('span', { className: 'cs-cfg-tag' }, '已覆盖'),
        h('button', { type: 'button', className: 'cs-cfg-reset', disabled: disabled, onClick: () => model.resetField(spec.key) }, '恢复默认')) : null;

      if (spec.kind === 'boolean') {
        const checked = state.text === 'true';
        return h('div', { className: 'cs-cfg-field' },
          h('div', { className: 'cs-cfg-head' },
            h('label', { className: 'cs-cfg-label', htmlFor: id }, spec.label),
            overridden,
            h('button', {
              id: id,
              type: 'button',
              role: 'switch',
              className: 'cs-cfg-switch',
              'aria-checked': checked,
              'aria-describedby': messageId,
              disabled: disabled,
              onClick: () => model.edit(spec.key, checked ? 'false' : 'true'),
            }, h('span', { className: 'cs-cfg-switch-thumb' }))),
          h('p', { id: messageId, className: 'cs-cfg-hint' }, spec.hint));
      }

      return h('div', { className: 'cs-cfg-field' },
        h('div', { className: 'cs-cfg-head' },
          h('label', { className: 'cs-cfg-label', htmlFor: id }, spec.label),
          overridden),
        h('input', {
          id: id,
          className: 'cs-cfg-input',
          type: 'text',
          inputMode: 'numeric',
          'aria-invalid': state.invalid ? true : undefined,
          'aria-describedby': messageId,
          value: state.text,
          placeholder: spec.placeholder,
          disabled: disabled,
          onChange: (event) => model.edit(spec.key, event.target.value),
        }),
        h('p', { id: messageId, className: state.invalid ? 'cs-cfg-invalid' : 'cs-cfg-hint', role: state.invalid ? 'alert' : undefined },
          state.invalid ? '请填数字；留空表示使用默认值。' : spec.hint));
    }

    /** The row's configure page: staged fields plus the page's own save control. */
    function ConfigPanel({ model, view }) {
      const [, setTick] = useState(0);
      useEffect(() => {
        const bump = () => setTick((value) => value + 1);
        const off = model.subscribe(bump);
        return () => {
          off();
          model.discard();
        };
      }, [model]);

      if (view === 'summary') return '毛玻璃与透明度';
      const shell = model.shell();
      if (!shell.available) return h('p', { className: 'cs-cfg-note', role: 'status' }, '该插件当前未加载，暂时无法配置。');
      return h('div', { className: 'cs-cfg-form' },
        shell.writable ? null : h('p', { className: 'cs-cfg-note', role: 'status' }, '本部署的设置为只读。'),
        CONFIG_FIELDS.map((spec) => h(ConfigField, { key: spec.key, model: model, spec: spec, disabled: !shell.writable })),
        h('div', { className: 'cs-cfg-footer' },
          shell.failed ? h('p', { className: 'cs-cfg-failed', role: 'status' }, '本部署没有接受这些值，已保留供你修改。') : null,
          h('button', {
            type: 'button',
            className: 'cs-cfg-save',
            disabled: !shell.dirty || shell.invalid || shell.saving,
            onClick: () => model.save(),
          }, shell.saving ? '保存中…' : '保存')));
    }

    function ChatSearch({ model, sessionId }) {
      const [open, setOpen] = useState(false);
      useEffect(() => {
        const onKey = (event) => {
          if ((event.ctrlKey || event.metaKey) && !event.altKey && (event.key === 'f' || event.key === 'F')) {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }
        };
        window.addEventListener('keydown', onKey, true);
        return () => window.removeEventListener('keydown', onKey, true);
      }, []);
      return h(React.Fragment, null,
        h('button', { type: 'button', className: 'cs-trigger', title: '搜索对话 (Ctrl+F)', onClick: () => setOpen(true) }, h(IconSearch, { size: 15 })),
        open ? h(SearchBar, { key: sessionId, model, onClose: () => setOpen(false) }) : null);
    }

    return {
      inject: ['slots', 'configForms'],
      apply(ctx) {
        const model = new SettingsModel(ctx.configForms.get(CONFIG_NS), CONFIG_FIELDS);
        ctx.effect(() => () => model.dispose(), 'chat-search: config form');
        ctx.effect(() => {
          ensureStyle();
          return () => {
            const style = document.querySelector('style[data-chat-search]');
            if (style !== null) style.remove();
          };
        }, 'chat-search: styles');
        ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register({
          name: 'conversation.session.header.utilities',
          id: 'chat-search',
          order: 5,
        }, (props) => h(ChatSearch, { model, sessionId: props.sessionId })));
        ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
          name: 'plugins.row.config',
          key: '@local/dsh-chat-search#chat-search',
        }, (props) => h(ConfigPanel, { model, view: props.view })));
      },
    };
  },
});
