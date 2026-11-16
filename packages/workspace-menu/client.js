window.__ModuleLoader__.load({
  id: '@local/dsh-workspace-menu',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useState, useEffect, useRef } = React;

    const NS = 'workspace.menu';
    const ROW_PREFIX = 'workspace:';
    const MENU_WIDTH = 208;
    const MENU_HEIGHT = 128;
    const FAVORITES_KEY = 'dsh-workspace-menu:favorites';
    const FAVORITE_ATTR = 'data-workspace-favorite';
    const FAVORITE_CSS = '[data-workspace-favorite="true"] [class*="title"]{color:var(--dsw-alias-state-business-primary);font-weight:600}';

    const zh = {
      openInExplorer: '用文件资源管理器打开',
      addFavorite: '添加收藏',
      removeFavorite: '取消收藏',
      rename: '重命名',
      renameTitle: '重命名工作区',
      renameHint: '输入新的工作区名称。',
      cancel: '取消',
      save: '保存',
      saving: '保存中…',
      emptyName: '名称不能为空。',
      renameFailed: '重命名失败：{message}',
      openFailed: '打开失败：{message}',
    };

    const en = {
      openInExplorer: 'Open in File Explorer',
      addFavorite: 'Add to favorites',
      removeFavorite: 'Remove from favorites',
      rename: 'Rename',
      renameTitle: 'Rename workspace',
      renameHint: 'Enter a new workspace name.',
      cancel: 'Cancel',
      save: 'Save',
      saving: 'Saving…',
      emptyName: 'The name cannot be empty.',
      renameFailed: 'Rename failed: {message}',
      openFailed: 'Open failed: {message}',
    };

    const menuStyle = {
      position: 'fixed',
      zIndex: 1200,
      minWidth: MENU_WIDTH,
      padding: 4,
      boxSizing: 'border-box',
      borderRadius: 'var(--dsw-radius-lg, 12px)',
      background: 'var(--dsw-specific-menu, #ffffff)',
      backdropFilter: 'var(--dsw-menu-backdrop-filter)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      border: '.5px solid var(--dsw-alias-border-l2)',
      color: 'var(--dsw-alias-label-primary)',
      pointerEvents: 'auto',
    };

    const itemStyle = {
      display: 'block',
      width: '100%',
      padding: '5px 8px',
      border: 'none',
      borderRadius: 'var(--dsw-radius-sm, 6px)',
      background: 'transparent',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 13,
      lineHeight: '20px',
      textAlign: 'left',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    };

    const layerStyle = {
      position: 'fixed',
      inset: 0,
      zIndex: 1300,
      display: 'grid',
      placeItems: 'center',
      padding: 24,
      background: 'var(--dsw-alias-bg-mask-1, rgba(0, 0, 0, 0.18))',
      pointerEvents: 'auto',
    };

    const dialogStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      width: 'min(360px, 100%)',
      padding: 20,
      boxSizing: 'border-box',
      borderRadius: 'var(--dsw-radius-panel)',
      background: 'var(--dsw-alias-bg-layer-2)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      color: 'var(--dsw-alias-label-primary)',
    };

    const titleStyle = { fontSize: 15, lineHeight: '22px', fontWeight: 500 };
    const hintStyle = { margin: 0, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' };
    const errorStyle = { margin: 0, fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-error-primary)' };

    const inputStyle = {
      height: 34,
      padding: '0 10px',
      border: '.5px solid var(--dsw-alias-border-l4)',
      borderRadius: 'var(--dsw-radius-md)',
      background: 'var(--dsw-alias-bg-layer-3)',
      color: 'var(--dsw-alias-label-primary)',
      font: 'inherit',
      fontSize: 13,
    };

    const footerStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 };

    const primaryButtonStyle = {
      appearance: 'none',
      border: '1px solid transparent',
      borderRadius: 'var(--dsw-radius-md)',
      padding: '5px 14px',
      font: 'inherit',
      fontSize: 13,
      lineHeight: 1.5,
      cursor: 'pointer',
      background: 'var(--dsw-alias-label-primary)',
      color: 'var(--dsw-alias-bg-layer-3)',
    };

    const secondaryButtonStyle = {
      ...primaryButtonStyle,
      background: 'transparent',
      border: '.5px solid var(--dsw-alias-border-l4)',
      color: 'var(--dsw-alias-label-secondary)',
    };

    const toastStyle = {
      position: 'fixed',
      left: '50%',
      bottom: 24,
      zIndex: 1400,
      transform: 'translateX(-50%)',
      maxWidth: 'min(560px, calc(100vw - 32px))',
      padding: '8px 14px',
      borderRadius: 'var(--dsw-radius-lg)',
      background: 'var(--dsw-alias-toast-bg, #1f2329)',
      color: 'var(--dsw-alias-toast-label, #ffffff)',
      boxShadow: 'var(--dsw-elevation-prominent)',
      fontSize: 13,
      lineHeight: '20px',
      pointerEvents: 'none',
    };

    function messageOf(error) {
      return String((error && error.message) || error);
    }

    function loadFavorites() {
      try {
        const raw = window.localStorage.getItem(FAVORITES_KEY);
        if (raw === null) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && id !== '') : [];
      } catch (error) {
        return [];
      }
    }

    function saveFavorites(ids) {
      try {
        window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
      } catch (error) {}
    }

    function markFavorites(ids) {
      const wanted = new Set(ids);
      const rows = document.querySelectorAll('[data-row-key^="workspace:"]');
      for (const row of rows) {
        const key = row.getAttribute('data-row-key');
        if (key === null) continue;
        const workspaceId = key.slice(ROW_PREFIX.length);
        if (wanted.has(workspaceId)) row.setAttribute(FAVORITE_ATTR, 'true');
        else row.removeAttribute(FAVORITE_ATTR);
      }
    }

    function menuPosition(x, y) {
      return {
        left: Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 8)),
        top: Math.max(8, Math.min(y, window.innerHeight - MENU_HEIGHT - 8)),
      };
    }

    function WorkspaceMenu({ ctx, t, useWorkspaces = () => [] }) {
      const workspaces = useWorkspaces((state) => state.items);
      const [menu, setMenu] = useState(null);
      const [hover, setHover] = useState(null);
      const [rename, setRename] = useState(null);
      const [toast, setToast] = useState(null);
      const [favorites, setFavorites] = useState(loadFavorites);
      const renameOpen = rename !== null;
      const menuRef = useRef(null);
      const inputRef = useRef(null);

      useEffect(() => {
        const onContextMenu = (event) => {
          const target = event.target instanceof Element ? event.target.closest('[data-row-key^="workspace:"]') : null;
          if (target === null) {
            setMenu(null);
            return;
          }
          const key = target.getAttribute('data-row-key');
          if (key === null || !key.startsWith(ROW_PREFIX)) return;
          const workspaceId = key.slice(ROW_PREFIX.length);
          const workspace = workspaces.find((item) => item.workspaceId === workspaceId);
          if (workspace === undefined) return;
          event.preventDefault();
          const position = menuPosition(event.clientX, event.clientY);
          setHover(null);
          setMenu({ ...position, workspace: workspace });
        };
        document.addEventListener('contextmenu', onContextMenu, true);
        return () => document.removeEventListener('contextmenu', onContextMenu, true);
      }, [workspaces]);

      useEffect(() => {
        if (menu === null) return undefined;
        const onPointerDown = (event) => {
          if (menuRef.current !== null && menuRef.current.contains(event.target)) return;
          setMenu(null);
        };
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setMenu(null);
        };
        const close = () => setMenu(null);
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        document.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        window.addEventListener('blur', close);
        return () => {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown, true);
          document.removeEventListener('scroll', close, true);
          window.removeEventListener('resize', close);
          window.removeEventListener('blur', close);
        };
      }, [menu]);

      useEffect(() => {
        if (!renameOpen) return undefined;
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setRename(null);
        };
        document.addEventListener('keydown', onKeyDown, true);
        if (inputRef.current !== null) {
          inputRef.current.focus();
          inputRef.current.select();
        }
        return () => document.removeEventListener('keydown', onKeyDown, true);
      }, [renameOpen]);

      useEffect(() => {
        if (toast === null) return undefined;
        const timer = window.setTimeout(() => setToast(null), 4000);
        return () => window.clearTimeout(timer);
      }, [toast]);

      useEffect(() => {
        markFavorites(favorites);
        const root = document.querySelector('[data-slot="sidebar"]') ?? document.body;
        let frame = 0;
        const schedule = () => {
          if (frame !== 0) return;
          frame = window.requestAnimationFrame(() => {
            frame = 0;
            markFavorites(favorites);
          });
        };
        const observer = new MutationObserver(schedule);
        observer.observe(root, { childList: true, subtree: true });
        return () => {
          observer.disconnect();
          if (frame !== 0) window.cancelAnimationFrame(frame);
        };
      }, [favorites]);

      const toggleFavorite = (workspaceId) => {
        setFavorites((current) => {
          const next = current.includes(workspaceId)
            ? current.filter((id) => id !== workspaceId)
            : current.concat([workspaceId]);
          saveFavorites(next);
          return next;
        });
        setMenu(null);
      };

      const openFolder = async (workspace) => {
        setMenu(null);
        try {
          const result = await ctx.remote.session.openWorkspacePath({ path: workspace.path });
          if (!result || result.ok !== true) {
            const failure = result && result.error;
            throw new Error((failure && (failure.code || failure.message)) || 'open-error');
          }
        } catch (error) {
          setToast(t('openFailed', { message: messageOf(error) }));
        }
      };

      const submitRename = async (event) => {
        event.preventDefault();
        if (rename === null || rename.busy) return;
        const title = rename.value.trim();
        if (title === '') {
          setRename({ ...rename, error: t('emptyName') });
          return;
        }
        setRename({ ...rename, busy: true, error: null });
        try {
          await ctx.workspaces.rename(rename.workspace.workspaceId, title);
          setRename(null);
        } catch (error) {
          setRename((current) => (current === null ? null : { ...current, busy: false, error: t('renameFailed', { message: messageOf(error) }) }));
        }
      };

      const menuItem = (id, label, action) => h('button', {
        type: 'button',
        role: 'menuitem',
        style: { ...itemStyle, background: hover === id ? 'var(--dsw-alias-interactive-bg-hover)' : 'transparent' },
        onMouseEnter: () => setHover(id),
        onMouseLeave: () => setHover(null),
        onClick: action,
      }, label);

      const menuFavorite = menu !== null && favorites.includes(menu.workspace.workspaceId);

      return h(React.Fragment, null,
        menu === null ? null : h('div', { ref: menuRef, role: 'menu', style: { ...menuStyle, left: menu.left, top: menu.top } },
          menuItem('open', t('openInExplorer'), () => { openFolder(menu.workspace); }),
          menuItem('favorite', menuFavorite ? t('removeFavorite') : t('addFavorite'), () => {
            toggleFavorite(menu.workspace.workspaceId);
          }),
          menuItem('rename', t('rename'), () => {
            setRename({ workspace: menu.workspace, value: menu.workspace.title, error: null, busy: false });
            setMenu(null);
          })),
        rename === null ? null : h('div', {
          style: layerStyle,
          onPointerDown: (event) => { if (event.target === event.currentTarget) setRename(null); },
        },
        h('form', { style: dialogStyle, role: 'dialog', 'aria-modal': 'true', 'aria-label': t('renameTitle'), onSubmit: submitRename },
          h('div', { style: titleStyle }, t('renameTitle')),
          h('p', { style: hintStyle }, t('renameHint')),
          h('input', {
            ref: inputRef,
            style: inputStyle,
            value: rename.value,
            disabled: rename.busy,
            'aria-label': t('renameTitle'),
            onChange: (event) => setRename({ ...rename, value: event.target.value, error: null }),
          }),
          rename.error === null ? null : h('p', { style: errorStyle, role: 'alert' }, rename.error),
          h('div', { style: footerStyle },
            h('button', { type: 'button', style: secondaryButtonStyle, disabled: rename.busy, onClick: () => setRename(null) }, t('cancel')),
            h('button', {
              type: 'submit',
              style: { ...primaryButtonStyle, opacity: rename.busy || rename.value.trim() === '' ? 0.4 : 1 },
              disabled: rename.busy || rename.value.trim() === '',
            }, rename.busy ? t('saving') : t('save'))))),
        toast === null ? null : h('div', { style: toastStyle, role: 'status' }, toast));
    }

    return {
      inject: ['slots', 'workspaces', 'remote', 'remote.session', 'locale'],
      apply(ctx) {
        const t = ctx.locale.bind(NS);
        ctx.effect(() => ctx.locale.register(NS, { zh: zh, en: en }), 'workspace-menu: dictionaries');
        ctx.effect(() => {
          const style = document.createElement('style');
          style.setAttribute('data-workspace-menu', '1');
          style.textContent = FAVORITE_CSS;
          document.head.appendChild(style);
          return () => {
            style.remove();
          };
        }, 'workspace-menu: favorite styles');
        ctx.slots.inject('shell.overlay', () => ctx.slots.register({
          name: 'shell.overlay',
          id: 'workspace-menu',
          order: 20,
        }, (props) => h(WorkspaceMenu, { ctx: ctx, t: t, useWorkspaces: props.useWorkspaces })));
      },
    };
  },
});
