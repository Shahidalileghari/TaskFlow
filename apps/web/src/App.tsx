import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { api, Task, User } from './api';

type Session = { token: string; user: User };
const SESSION_KEY = 'taskflow-session';

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) as Session : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(readSession);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'done'>('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadTasks = useCallback(async (token: string) => {
    const result = await api.listTasks(token);
    setTasks(result.tasks);
  }, []);

  useEffect(() => {
    if (!session) return;
    loadTasks(session.token).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not load tasks');
    });
  }, [session, loadTasks]);

  const visibleTasks = useMemo(() => tasks.filter((task) => {
    if (filter === 'open') return !task.completed;
    if (filter === 'done') return task.completed;
    return true;
  }), [tasks, filter]);

  async function submitAuth(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      const result = mode === 'register'
        ? await api.register({ name, email, password })
        : await api.login({ email, password });
      const next = { token: result.token, user: result.user };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      setPassword('');
      setNotice(mode === 'register' ? 'Account created. Welcome to TaskFlow!' : 'Signed in successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null); setTasks([]); setError(''); setNotice('You have signed out.');
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!session) return;
    setBusy(true); setError('');
    try {
      const result = await api.createTask(session.token, { title, description });
      setTasks((current) => [result.task, ...current]);
      setTitle(''); setDescription('');
      setNotice('Task created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create task');
    } finally { setBusy(false); }
  }

  async function toggleTask(task: Task) {
    if (!session) return;
    try {
      const result = await api.updateTask(session.token, task.id, { completed: !task.completed });
      setTasks((current) => current.map((item) => item.id === task.id ? result.task : item));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update task'); }
  }

  async function deleteTask(task: Task) {
    if (!session) return;
    try {
      await api.deleteTask(session.token, task.id);
      setTasks((current) => current.filter((item) => item.id !== task.id));
      setNotice('Task deleted.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete task'); }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="TaskFlow home"><span className="brand-mark">✓</span> TaskFlow</a>
        {session && <div className="profile"><span className="avatar">{session.user.name.slice(0, 1).toUpperCase()}</span><span>{session.user.name}</span><button className="button button-ghost" onClick={signOut}>Sign out</button></div>}
      </header>

      {!session ? (
        <section className="auth-layout">
          <div className="hero-copy">
            <span className="eyebrow">YOUR WORK, IN FLOW</span>
            <h1>Make room for<br /><span>meaningful work.</span></h1>
            <p>A calmer place to capture priorities, build momentum, and get things done.</p>
            <div className="hero-points"><span>✓ Focus on what matters</span><span>✓ Track every small win</span><span>✓ Keep your day moving</span></div>
          </div>
          <form className="panel auth-card" onSubmit={submitAuth}>
            <div className="panel-heading"><h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{mode === 'login' ? 'Sign in to continue to your workspace.' : 'A few details and you’re ready to go.'}</p></div>
            {mode === 'register' && <label>Full name<input autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={80} placeholder="Ada Lovelace" /></label>}
            <label>Email address<input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} placeholder="you@example.com" /></label>
            <label>Password<input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={mode === 'register' ? 10 : 1} maxLength={72} placeholder={mode === 'register' ? 'At least 10 characters' : 'Your password'} /></label>
            {error && <p className="alert alert-error" role="alert">{error}</p>}
            {notice && <p className="alert alert-success" role="status">{notice}</p>}
            <button className="button button-primary button-wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span aria-hidden="true">→</span></button>
            <p className="switch-mode">{mode === 'login' ? 'New to TaskFlow?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          </form>
        </section>
      ) : (
        <section className="workspace">
          <div className="workspace-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Good things take <span>focus.</span></h1><p>One step at a time. You’ve got this.</p></div><div className="stat-card"><span className="stat-number">{tasks.filter(t => t.completed).length}<small> / {tasks.length}</small></span><span className="stat-label">tasks completed</span></div></div>
          {error && <p className="alert alert-error" role="alert">{error}</p>}
          {notice && <p className="alert alert-success" role="status">{notice}</p>}
          <div className="workspace-grid">
            <form className="panel create-card" onSubmit={addTask}><div className="panel-heading"><h2>Capture a task</h2><p>Get it out of your head and into your plan.</p></div><label>Task title<input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={1} maxLength={160} placeholder="What needs to get done?" /></label><label>Details <span className="optional">(optional)</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} rows={4} placeholder="Add a little context…" /></label><button className="button button-primary button-wide" disabled={busy || !title.trim()}>＋ Add task</button></form>
            <section className="panel task-panel"><div className="task-heading"><div><h2>Your tasks</h2><p>{tasks.filter(t => !t.completed).length} things left to focus on</p></div><div className="filters" aria-label="Filter tasks">{(['all', 'open', 'done'] as const).map((value) => <button key={value} className={filter === value ? 'filter active' : 'filter'} onClick={() => setFilter(value)}>{value === 'all' ? 'All' : value === 'open' ? 'To do' : 'Done'}</button>)}</div></div>
              {visibleTasks.length === 0 ? <div className="empty-state"><div className="empty-icon">✦</div><h3>{filter === 'all' ? 'A fresh start.' : 'Nothing here yet.'}</h3><p>{filter === 'done' ? 'Completed tasks will show up here.' : filter === 'open' ? 'You’ve cleared your list. Nice work!' : 'Add your first task to get into a good flow.'}</p></div> : <ul className="task-list">{visibleTasks.map((task) => <li className={task.completed ? 'task-item completed' : 'task-item'} key={task.id}><button className={task.completed ? 'task-check checked' : 'task-check'} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} onClick={() => void toggleTask(task)}>{task.completed ? '✓' : ''}</button><div className="task-content"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<span className="task-date">{new Date(task.created_at).toLocaleDateString()}</span></div><button className="delete-button" aria-label={`Delete ${task.title}`} onClick={() => void deleteTask(task)}>×</button></li>)}</ul>}
            </section>
          </div>
          <footer className="workspace-footer">Small steps are still progress. <span>✦</span></footer>
        </section>
      )}
      <footer className="site-footer"><span>© 2026 TaskFlow</span><span>Less noise. More meaningful work.</span></footer>
    </main>
  );
}
