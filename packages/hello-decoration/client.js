window.__ModuleLoader__.load({
  id: '@local/dsh-hello-decoration',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    function HelloBadge() {
      return h('div', {
        style: {
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '2px 8px', margin: '4px auto 0',
          borderRadius: 999, fontSize: 12, lineHeight: '18px',
          color: '#247bbf', background: 'rgba(36, 123, 191, 0.12)',
          pointerEvents: 'none', userSelect: 'none',
        },
      }, 'Hello DSH');
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock', id: 'hello-decoration', order: 5,
        }, HelloBadge));
      },
    };
  },
});
