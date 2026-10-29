window.__ModuleLoader__.load({
  id: '@local/dsh-git-branch-pill',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef, useCallback } = React;

    /** Same metrics as the built-in status pills (turns / cache hit). */
    const pillStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      minWidth: 0,
      maxWidth: 260,
      padding: '1px 8px',
      borderRadius: 'var(--dsw-radius-sm, 6px)',
      color: 'var(--dsw-alias-label-tertiary)',
      fontSize: 'calc(var(--dsh-content-font-size-secondary, 13px) - 1px)',
      lineHeight: 'calc(20px + var(--dsh-content-font-delta-secondary, 0px))',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
      userSelect: 'none',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      fontFamily: 'inherit',
      fontWeight: 'inherit',
    };

    const labelStyle = { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' };

    function BranchIcon({ size = 14 }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 16 16',
        fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
        strokeLinecap: 'round', strokeLinejoin: 'round',
        'aria-hidden': true,
      },
      h('circle', { cx: 11.5, cy: 3.5, r: 1.75 }),
      h('circle', { cx: 4.5, cy: 12.5, r: 1.75 }),
      h('path', { d: 'M4.5 10.6V5.5a2 2 0 0 1 2-2h2.2' }),
      h('path', { d: 'M9.9 5.9a2 2 0 0 0 1.6 1.6' }));
    }

    /** The raw Remote transport shared with the Host's Typert Gateway. */
    function getRpc(ctx) {
      try {
        const connection = ctx.get('connection');
        const rpc = connection && connection.rpc;
        return rpc && typeof rpc.call === 'function' ? rpc : null;
      } catch {
        return null;
      }
    }

    /** Ask the Host half for branch and change totals. */
    async function fetchStats(ctx, sessionId) {
      const rpc = getRpc(ctx);
      if (rpc === null) throw new Error('no-connection');
      const result = await rpc.call('/api', 'gitPill/stats', { args: { request: { sessionId } } });
      let payload = result;
      if (payload && payload.ok === true && payload.value && typeof payload.value.ok === 'boolean') payload = payload.value;
      if (!payload || payload.ok !== true) {
        const error = payload && payload.error;
        throw new Error(String(error && (error.code || error.message) || 'unknown'));
      }
      return payload.value;
    }

    /** Fallback: read the branch name straight out of .git/HEAD. */
    async function readHeadBranch(ctx, sessionId) {
      const remote = ctx.remote;
      if (!remote || !remote.workspaceFiles) return null;
      const readFile = async (path) => {
        const result = await remote.workspaceFiles.read(sessionId, path, { offset: 1, limit: 20 });
        if (!result || result.ok !== true) return null;
        return result.value && typeof result.value.text === 'string' ? result.value.text : null;
      };
      const head = await readFile('.git/HEAD');
      if (head === null) return null;
      const line = head.trim();
      if (line.startsWith('gitdir:')) {
        const dir = line.slice(7).trim().replace(/\\/g, '/').replace(/\/+$/, '');
        const nested = await readFile(dir + '/HEAD');
        return nested === null ? null : parseRef(nested);
      }
      return parseRef(head);
    }

    function parseRef(text) {
      const line = String(text).trim();
      if (line.startsWith('ref:')) {
        const ref = line.slice(4).trim().replace(/^refs\/heads\//, '').replace(/^refs\//, '');
        return ref === '' ? null : ref;
      }
      return /^[0-9a-f]{7,40}$/i.test(line) ? line.slice(0, 7) : null;
    }

    /** Geometry copied from the built-in stats dialog (stat-dialog.module.css). */
    const panelStyle = {
      position: 'fixed',
      zIndex: 1100,
      boxSizing: 'border-box',
      borderRadius: 'var(--dsw-radius-lg, 12px)',
      background: 'var(--dsw-specific-menu, #ffffff)',
      width: 'max-content',
      minWidth: 'min(300px, 100vw - 24px)',
      maxWidth: 'min(440px, 100vw - 24px)',
      backdropFilter: 'var(--dsw-menu-backdrop-filter)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      color: 'var(--dsw-alias-label-secondary)',
      cursor: 'default',
      border: 0,
      padding: 16,
      fontSize: 12,
      lineHeight: '18px',
    };

    const titleStyle = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 8,
      fontWeight: 500,
      color: 'var(--dsw-alias-label-primary)',
    };

    const titleLabelStyle = { display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 };

    const ruleStyle = { borderTop: '.5px solid var(--dsw-alias-border-l2)', marginBottom: 10 };

    const detailsStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(76px, auto) minmax(0, 1fr)',
      gap: '6px 16px',
      margin: 0,
      color: 'var(--dsw-alias-label-tertiary)',
    };

    const dtStyle = { margin: 0, minWidth: 0 };
    const ddStyle = (color) => ({
      margin: 0,
      minWidth: 0,
      textAlign: 'right',
      color: color || 'var(--dsw-alias-label-secondary)',
      fontVariantNumeric: 'tabular-nums',
    });

    function Pair({ label, value, color }) {
      return h(React.Fragment, null,
        h('dt', { style: dtStyle }, label),
        h('dd', { style: ddStyle(color) }, value));
    }

    function Panel({ data, error, rect }) {
      const style = {
        ...panelStyle,
        left: Math.round(rect.left),
        bottom: Math.round(window.innerHeight - rect.top + 8),
      };
      const pairs = [h(Pair, { key: 'branch', label: '分支', value: data !== null ? (data.branch || '(unknown)') : '(unknown)' })];
      if (data !== null && typeof data.insertions === 'number' && typeof data.deletions === 'number') {
        pairs.push(h(Pair, { key: 'ins', label: '新增', value: '+' + data.insertions, color: 'var(--dsw-alias-state-success-primary)' }));
        pairs.push(h(Pair, { key: 'del', label: '删除', value: '−' + data.deletions, color: 'var(--dsw-alias-state-error-primary)' }));
      }
      if (data !== null && typeof data.untracked === 'number') {
        pairs.push(h(Pair, { key: 'untracked', label: '未跟踪', value: String(data.untracked) + ' 个文件' }));
      }
      if (error !== null) {
        pairs.push(h(Pair, { key: 'diag', label: '错误', value: error, color: 'var(--dsw-alias-state-error-primary)' }));
      }
      return h('div', { style, role: 'dialog' },
        h('div', { style: titleStyle },
          h('span', { style: titleLabelStyle }, h(BranchIcon, { size: 14 }), h('span', null, 'Git 变更'))),
        h('div', { style: ruleStyle }),
        h('dl', { style: detailsStyle }, ...pairs));
    }

    function BranchPill({ ctx, sessionId }) {
      const [data, setData] = useState(null);
      const [error, setError] = useState(null);
      const [open, setOpen] = useState(false);
      const [rect, setRect] = useState(null);
      const buttonRef = useRef(null);
      const panelRef = useRef(null);

      const refresh = useCallback(() => {
        if (sessionId === undefined) return;
        fetchStats(ctx, sessionId).then((value) => {
          setData(value);
          setError(null);
        }).catch((failure) => {
          readHeadBranch(ctx, sessionId).then((branch) => {
            if (branch === null) {
              setError(String(failure && failure.message || failure));
              setData(null);
              return;
            }
            setData({ branch, insertions: null, deletions: null, untracked: null });
            setError(String(failure && failure.message || failure));
          }).catch(() => {
            setError(String(failure && failure.message || failure));
            setData(null);
          });
        });
      }, [ctx, sessionId]);

      useEffect(() => {
        if (sessionId === undefined) return;
        let alive = true;
        const tick = () => { if (alive) refresh(); };
        tick();
        const timer = setInterval(tick, 8000);
        return () => { alive = false; clearInterval(timer); };
      }, [refresh, sessionId]);

      useEffect(() => {
        if (!open) return;
        const onPointerDown = (event) => {
          const inside = (buttonRef.current && buttonRef.current.contains(event.target))
            || (panelRef.current && panelRef.current.contains(event.target));
          if (!inside) setOpen(false);
        };
        const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false); };
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown, true);
        };
      }, [open]);

      if (sessionId === undefined) return null;
      if (data === null && error === null) return null;

      const failed = data === null && error !== null;
      const label = data !== null ? (data.branch || '?') : (failed ? error : '?');
      const labelStyleUsed = failed ? { ...labelStyle, color: 'var(--dsw-alias-state-error-primary)' } : labelStyle;
      const onClick = () => {
        if (buttonRef.current !== null) setRect(buttonRef.current.getBoundingClientRect());
        setOpen((value) => {
          if (!value && data !== null) refresh();
          return !value;
        });
      };

      return h(React.Fragment, null,
        h('button', {
          ref: buttonRef,
          type: 'button',
          style: pillStyle,
          title: data !== null ? '当前 Git 分支，点击查看改动' : (error || ''),
          'aria-haspopup': 'dialog',
          'aria-expanded': open,
          onClick,
          onMouseEnter: (event) => { event.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)'; },
          onMouseLeave: (event) => { event.currentTarget.style.background = 'transparent'; },
        },
        h(BranchIcon, null),
        h('span', { style: labelStyleUsed }, label)),
        open && rect !== null ? h('div', { ref: panelRef, style: { display: 'contents' } }, h(Panel, { data, error, rect })) : null);
    }

    return {
      inject: ['slots', 'connection', 'remote', 'remote.workspaceFiles'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'git-branch-pill',
          order: -1,
        }, (props) => h(BranchPill, { ctx, sessionId: props.sessionId })));
      },
    };
  },
});
