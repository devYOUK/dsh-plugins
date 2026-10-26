import { execFile } from 'node:child_process';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';

const GIT_TIMEOUT_MS = 5000;

/** Run one git command; resolves to { ok, stdout } and never rejects. */
function run(argv, cwd) {
  return new Promise((resolve) => {
    execFile(argv[0], argv.slice(1), {
      cwd,
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: 8 * 1024 * 1024,
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', LC_ALL: 'C' },
    }, (error, stdout) => resolve({ ok: error === null, stdout: String(stdout ?? '') }));
  });
}

/** Sum `--numstat` output into insertion and deletion totals. */
function sumNumstat(text) {
  let insertions = 0;
  let deletions = 0;
  for (const line of text.split('\n')) {
    const match = /^(\d+|-)\t(\d+|-)\t/.exec(line);
    if (match === null) continue;
    if (match[1] !== '-') insertions += Number(match[1]);
    if (match[2] !== '-') deletions += Number(match[2]);
  }
  return { insertions, deletions };
}

/** Count entries reported as untracked by `git status --porcelain`. */
function countUntracked(text) {
  let count = 0;
  for (const line of text.split('\n')) if (line.startsWith('?? ')) count += 1;
  return count;
}

/** Pull the workspace path out of a live session entry. */
function cwdOf(entry) {
  if (entry === null || typeof entry !== 'object') return undefined;
  const header = entry.header;
  if (header !== null && typeof header === 'object' && typeof header.cwd === 'string' && header.cwd !== '') return header.cwd;
  if (typeof entry.cwd === 'string' && entry.cwd !== '') return entry.cwd;
  return undefined;
}

/** Host half: reads the checked-out branch and working-tree totals for the composer pill. */
class GitPillService extends TypertRemoteService {
  constructor(ctx) {
    super(ctx, 'gitPill');
  }

  /**
   * Read the branch and change totals of the session workspace.
   * @param request - { sessionId }
   * @returns {{ ok: true, value: object } | { ok: false, error: { code: string, message?: string } }}
   */
  async stats(request) {
    try {
      const sessionId = request && request.sessionId;
      if (typeof sessionId !== 'string' || sessionId === '') {
        return { ok: false, error: { code: 'session-required', message: 'no session id' } };
      }

      const sessions = this.ctx.get('sessions');
      let cwd = cwdOf(sessions.get(sessionId));
      if (cwd === undefined) {
        const all = sessions.list();
        const match = Array.isArray(all) ? all.find((item) => item && (item.id === sessionId || item.sessionId === sessionId)) : undefined;
        cwd = cwdOf(match);
      }
      if (cwd === undefined) {
        return { ok: false, error: { code: 'cwd-unavailable', message: 'session workspace is unknown' } };
      }

      const top = await run(['git', 'rev-parse', '--show-toplevel'], cwd);
      if (!top.ok || top.stdout.trim() === '') {
        return { ok: false, error: { code: 'not-a-git-repo', message: 'not a git repository' } };
      }
      const root = top.stdout.trim();

      const symbolic = await run(['git', 'symbolic-ref', '--short', '-q', 'HEAD'], root);
      let branch = symbolic.ok ? symbolic.stdout.trim() : '';
      let detached = false;
      if (branch === '') {
        const short = await run(['git', 'rev-parse', '--short', 'HEAD'], root);
        branch = short.ok ? short.stdout.trim() : '';
        detached = branch !== '';
      }

      const hasHead = (await run(['git', 'rev-parse', '--verify', 'HEAD'], root)).ok;
      const diff = await run(hasHead ? ['git', 'diff', 'HEAD', '--numstat'] : ['git', 'diff', '--numstat'], root);
      const staged = hasHead ? { stdout: '' } : await run(['git', 'diff', '--cached', '--numstat'], root);
      const totals = sumNumstat(diff.stdout);
      const stagedTotals = sumNumstat(staged.stdout);
      const status = await run(['git', 'status', '--porcelain', '-uall'], root);

      return {
        ok: true,
        value: {
          root,
          branch,
          detached,
          insertions: totals.insertions + stagedTotals.insertions,
          deletions: totals.deletions + stagedTotals.deletions,
          untracked: status.ok ? countUntracked(status.stdout) : 0,
        },
      };
    } catch (error) {
      return { ok: false, error: { code: 'git-error', message: String(error && error.message || error) } };
    }
  }
}

// Declare the Remote method without TypeScript decorators: the protocol reads this
// plain string property off the prototype.
Object.defineProperty(GitPillService.prototype, '@deepseek-ai/dsh-typert-protocol/remote-methods', {
  configurable: true,
  value: Object.freeze({
    version: 1,
    methods: Object.freeze([Object.freeze({ method: 'stats', invocation: Object.freeze({ kind: 'direct' }) })]),
  }),
});

export default GitPillService;
export const inject = ['sessions'];
