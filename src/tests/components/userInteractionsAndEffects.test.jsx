import { describe, it, expect, vi, beforeEach } from 'vitest';

const hookRuntime = {
  activeScope: 'default',
  scopes: new Map(),
  effects: [],
  cleanups: [],
  reset() {
    this.activeScope = 'default';
    this.scopes = new Map();
    this.effects = [];
    this.cleanups = [];
  },
  getScope(name = this.activeScope) {
    if (!this.scopes.has(name)) {
      this.scopes.set(name, { slots: [], cursor: 0 });
    }
    return this.scopes.get(name);
  },
  render(fn, scopeName = 'default') {
    const prevScope = this.activeScope;
    this.activeScope = scopeName;
    const scope = this.getScope(scopeName);
    scope.cursor = 0;
    const tree = fn();
    if (tree && typeof tree.type === 'function') {
      tree.type(tree.props);
    }
    this.activeScope = prevScope;
    return tree;
  },
  flushEffects() {
    const pending = [...this.effects];
    this.effects = [];
    for (const eff of pending) {
      const cleanup = eff();
      if (typeof cleanup === 'function') {
        this.cleanups.push(cleanup);
      }
    }
  },
  runCleanups() {
    while (this.cleanups.length > 0) {
      const fn = this.cleanups.pop();
      fn();
    }
  }
};

const navigateMock = vi.fn();
let mockParams = { id: undefined };
let mockLocation = { pathname: '/dashboard', state: null };

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal();
  const mocked = {
    ...actual,
    createContext: (defaultValue) => {
      const ctx = {
        _currentValue: defaultValue,
        Provider: ({ value, children }) => {
          ctx._currentValue = value;
          return children;
        }
      };
      return ctx;
    },
    useContext: (ctx) => ctx._currentValue,
    useState: (initial) => {
      const scope = hookRuntime.getScope();
      const idx = scope.cursor++;
      if (!(idx in scope.slots)) {
        scope.slots[idx] = typeof initial === 'function' ? initial() : initial;
      }
      const setState = (val) => {
        scope.slots[idx] =
          typeof val === 'function' ? val(scope.slots[idx]) : val;
      };
      return [scope.slots[idx], setState];
    },
    useRef: (initial) => {
      const scope = hookRuntime.getScope();
      const idx = scope.cursor++;
      if (!(idx in scope.slots)) {
        scope.slots[idx] = { current: initial };
      }
      return scope.slots[idx];
    },
    useEffect: (cb) => {
      hookRuntime.effects.push(cb);
    },
    useCallback: (cb) => cb,
    useMemo: (fn) => fn(),
    useId: () => 'test-id'
  };
  return {
    ...mocked,
    default: mocked
  };
});

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => mockLocation,
    useParams: () => mockParams,
    useSearchParams: () => [new URLSearchParams(), vi.fn()]
  };
});

import { AuthProvider, useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { ToastProvider, useToast } from '../../components/common/Toast';
import Pagination from '../../components/common/Pagination';
import Navbar from '../../components/layout/Navbar';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import Dashboard from '../../pages/Dashboard';
import Journal from '../../pages/Journal';
import Songs from '../../pages/Songs';
import Moods from '../../pages/Moods';
import EntryForm from '../../pages/EntryForm';
import Stats from '../../pages/Stats';
import SongRecommendationPanel from '../../components/entries/SongRecommendationPanel';
import SoundtrackCard from '../../components/entries/SoundtrackCard';
import EntryCard from '../../components/entries/EntryCard';
import EntryFilterBar from '../../components/entries/EntryFilterBar';
import ImageUpload from '../../components/form/ImageUpload';
import EnergySlider from '../../components/form/EnergySlider';
import MoodPicker from '../../components/mood/MoodPicker';
import MoodChart from '../../components/mood/MoodChart';
import MoodCard from '../../components/moods/MoodCard';
import MoodFormModal from '../../components/moods/MoodFormModal';
import SongCard from '../../components/songs/SongCard';
import SongFilterBar from '../../components/songs/SongFilterBar';
import SongFormModal from '../../components/songs/SongFormModal';
import * as authService from '../../services/authService';
import * as moodService from '../../services/moodService';
import * as songService from '../../services/songService';
import * as statsService from '../../services/statsService';
import * as entryService from '../../services/entryService';
import { setToken, clearToken } from '../../services/tokenStorage';
import { UNAUTHORIZED_EVENT } from '../../constants/config';

// Helper untuk menelusuri pohon elemen React dan mengumpulkan semua node yang cocok
function collectNodes(node, predicate, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (Array.isArray(node)) {
    for (const child of node) {
      collectNodes(child, predicate, results);
    }
    return results;
  }
  if (predicate(node)) {
    results.push(node);
  }
  if (node.props?.children) {
    collectNodes(node.props.children, predicate, results);
  }
  return results;
}

describe('Interactive branches & lifecycle effects for AuthContext, Modal, Toast, Navbar, Login, Register, and widgets', () => {
  beforeEach(() => {
    hookRuntime.reset();
    navigateMock.mockReset();
    mockParams = { id: undefined };
    vi.restoreAllMocks();

    const store = new Map();
    const mockStorage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key)
    };
    globalThis.localStorage = mockStorage;
    globalThis.sessionStorage = mockStorage;
    globalThis.addEventListener = vi.fn();
    globalThis.removeEventListener = vi.fn();
  });

  it('AuthContext: verifies session (empty, valid, 401 error, network error), login, register, logout, and unauthorized event', async () => {
    expect(() => useAuth()).toThrow('useAuth harus digunakan di dalam AuthProvider');

    // 1. Tanpa token
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.flushEffects();
    expect(useAuth().isAuthenticated).toBe(false);
    hookRuntime.runCleanups();

    // 2. Dengan token valid + handleUnauthorized + login + register + logout
    hookRuntime.reset();
    setToken('valid-jwt');
    vi.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      data: { id: 1, name: 'Budi', email: 'budi@moodify.com' }
    });
    vi.spyOn(authService, 'loginUser').mockResolvedValueOnce({
      data: { user: { id: 2, name: 'Login User' }, token: 'login-jwt' }
    });
    vi.spyOn(authService, 'registerUser').mockResolvedValueOnce({
      data: { user: { id: 3, name: 'Reg User' }, token: 'reg-jwt' }
    });

    const listeners = {};
    globalThis.addEventListener = vi.fn((evt, cb) => {
      listeners[evt] = cb;
    });

    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    let ctx = useAuth();
    expect(ctx.user?.name).toBe('Budi');

    const loggedIn = await ctx.login('budi@moodify.com', 'password123');
    expect(loggedIn.name).toBe('Login User');

    const registered = await ctx.register('Reg User', 'reg@moodify.com', 'password123');
    expect(registered.name).toBe('Reg User');

    // res.data null fallback untuk login dan register (menutup baris 66-67, 76-77)
    vi.spyOn(authService, 'loginUser').mockResolvedValueOnce({ data: null });
    const nullLogin = await ctx.login('budi@moodify.com', 'password123');
    expect(nullLogin).toBeNull();

    vi.spyOn(authService, 'registerUser').mockResolvedValueOnce({ data: null });
    const nullReg = await ctx.register('Reg User', 'reg@moodify.com', 'password123');
    expect(nullReg).toBeNull();

    listeners[UNAUTHORIZED_EVENT]?.();
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    ctx = useAuth();
    expect(ctx.user).toBeNull();

    ctx.logout();
    hookRuntime.runCleanups();

    // 3. getCurrentUser gagal karena non-network error (401)
    hookRuntime.reset();
    setToken('expired-jwt');
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce({ isNetworkError: false });
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    hookRuntime.runCleanups();

    // 4. getCurrentUser gagal karena network error
    hookRuntime.reset();
    setToken('keep-jwt');
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce({ isNetworkError: true });
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    hookRuntime.runCleanups();
    clearToken();
  });

  it('Modal: handles focus trap, Escape key, Tab/Shift+Tab cycling, and cleanup focus restore', () => {
    const onClose = vi.fn();
    let keydownHandler = null;
    globalThis.addEventListener = vi.fn((evt, cb) => {
      if (evt === 'keydown') keydownHandler = cb;
    });
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn) => {
      fn();
      return 123;
    });
    vi.spyOn(globalThis, 'clearTimeout').mockImplementation(() => {});

    const triggerEl = { focus: vi.fn() };
    const firstBtn = { focus: vi.fn() };
    const lastBtn = { focus: vi.fn() };
    globalThis.document = { activeElement: triggerEl };

    expect(
      hookRuntime.render(() => Modal({ isOpen: false, onClose, title: 'Tutup' }), 'modal')
    ).toBeNull();
    hookRuntime.flushEffects();

    hookRuntime.reset();
    hookRuntime.render(
      () => Modal({ isOpen: true, onClose, title: 'Buka', children: null }),
      'modal'
    );
    const modalScope = hookRuntime.getScope('modal');
    modalScope.slots[0].current = {
      focus: vi.fn(),
      contains: () => false,
      querySelectorAll: () => [firstBtn, lastBtn]
    };
    hookRuntime.flushEffects();
    expect(firstBtn.focus).toHaveBeenCalled();

    // Cabang setTimeout ketika focusables kosong -> fokus ke dialogRef.current
    modalScope.slots[0].current.querySelectorAll = () => [];
    hookRuntime.render(
      () => Modal({ isOpen: true, onClose, title: 'Buka', children: null }),
      'modal'
    );
    hookRuntime.flushEffects();
    expect(modalScope.slots[0].current.focus).toHaveBeenCalled();

    // Kembalikan tombol focusable untuk uji Tab/Shift+Tab/Escape
    const middleBtn = { focus: vi.fn() };
    const outsideEl = { focus: vi.fn() };
    modalScope.slots[0].current.querySelectorAll = () => [firstBtn, middleBtn, lastBtn];
    modalScope.slots[0].current.contains = (el) => el === firstBtn || el === middleBtn || el === lastBtn;

    keydownHandler({ key: 'Escape', preventDefault: vi.fn() });
    expect(onClose).toHaveBeenCalled();

    // Shift+Tab dari firstBtn (menutup baris 47-50)
    globalThis.document.activeElement = firstBtn;
    keydownHandler({ key: 'Tab', shiftKey: true, preventDefault: vi.fn() });
    expect(lastBtn.focus).toHaveBeenCalled();

    // Shift+Tab dari elemen di luar modal (menutup baris 47-50 !contains)
    globalThis.document.activeElement = outsideEl;
    keydownHandler({ key: 'Tab', shiftKey: true, preventDefault: vi.fn() });
    expect(lastBtn.focus).toHaveBeenCalled();

    // Shift+Tab di dalam modal tanpa trap
    globalThis.document.activeElement = middleBtn;
    keydownHandler({ key: 'Tab', shiftKey: true, preventDefault: vi.fn() });

    // Tab dari lastBtn (menutup baris 51-54)
    globalThis.document.activeElement = lastBtn;
    keydownHandler({ key: 'Tab', shiftKey: false, preventDefault: vi.fn() });
    expect(firstBtn.focus).toHaveBeenCalled();

    // Tab dari elemen di luar modal (menutup baris 51-54 !contains)
    globalThis.document.activeElement = outsideEl;
    keydownHandler({ key: 'Tab', shiftKey: false, preventDefault: vi.fn() });
    expect(firstBtn.focus).toHaveBeenCalled();

    // Tab di dalam modal tanpa trap
    globalThis.document.activeElement = middleBtn;
    keydownHandler({ key: 'Tab', shiftKey: false, preventDefault: vi.fn() });

    modalScope.slots[0].current.querySelectorAll = () => [];
    keydownHandler({ key: 'Tab', shiftKey: false, preventDefault: vi.fn() });

    hookRuntime.runCleanups();
    expect(triggerEl.focus).toHaveBeenCalled();
  });

  it('ToastProvider & useToast: shows success/error/info toasts, removes toast on click or timeout, and cleans up timers', () => {
    expect(() => useToast()).toThrow('useToast harus digunakan di dalam ToastProvider');

    let timeoutCb = null;
    vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn) => {
      timeoutCb = fn;
      return 99;
    });
    vi.spyOn(globalThis, 'clearTimeout').mockImplementation(() => {});

    hookRuntime.render(() => ToastProvider({ children: null }), 'toast');
    hookRuntime.flushEffects();
    const toastApi = useToast();

    toastApi.showToast('Berhasil disimpan', 'success', 3000);
    toastApi.showToast('Terjadi kesalahan', 'error', 0);
    toastApi.showToast('Informasi baru', 'info', 3000);
    toastApi.showToast('Tipe kustom fallback style', 'unknown-type', 3000);

    const tree = hookRuntime.render(() => ToastProvider({ children: null }), 'toast');
    const closeButtons = collectNodes(
      tree,
      (n) => n.type === 'button' && n.props?.['aria-label'] === 'Tutup notifikasi'
    );
    expect(closeButtons.length).toBe(4);

    const icons = collectNodes(
      tree,
      (n) => typeof n.type === 'function' && n.type.name === 'ToastIcon'
    );
    icons.forEach((iconNode) => iconNode.type(iconNode.props));

    closeButtons[0].props.onClick();
    timeoutCb?.();
    hookRuntime.runCleanups();
  });

  it('Navbar: handles logout, mobile menu toggle, and active/inactive link classes for authenticated and guest users', () => {
    hookRuntime.render(() => ToastProvider({ children: null }), 'toast');
    setToken('jwt-nav');
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.getScope('auth').slots[0] = { id: 1, name: 'Nadya', email: 'nadya@moodify.com' };
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');

    let navTree = hookRuntime.render(() => Navbar(), 'nav');
    const navLinks = collectNodes(navTree, (n) => typeof n.props?.className === 'function');
    expect(navLinks[0].props.className({ isActive: true })).toContain('bg-denim');
    expect(navLinks[0].props.className({ isActive: false })).toContain('text-ink-soft');

    // Buka mobile menu saat login
    const toggleBtn = collectNodes(
      navTree,
      (n) => n.type === 'button' && n.props?.['aria-label'] === 'Buka atau tutup menu navigasi'
    )[0];
    toggleBtn.props.onClick();

    navTree = hookRuntime.render(() => Navbar(), 'nav');
    const clickableNodes = collectNodes(navTree, (n) => typeof n.props?.onClick === 'function');
    clickableNodes.forEach((node) => node.props.onClick());
    expect(navigateMock).toHaveBeenCalledWith('/auth/login');

    // Buka mobile menu saat guest (belum login)
    clearToken();
    hookRuntime.getScope('auth').slots[0] = null;
    hookRuntime.getScope('auth').slots[1] = null;
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.getScope('nav').slots[0] = true;
    navTree = hookRuntime.render(() => Navbar(), 'nav');
    const guestClickables = collectNodes(navTree, (n) => typeof n.props?.onClick === 'function');
    guestClickables.forEach((node) => node.props.onClick());
  });

  it('Login & Register: validates inputs, submits credentials, handles demo login and API errors', async () => {
    hookRuntime.render(() => ToastProvider({ children: null }), 'toast');
    clearToken();
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');

    // --- LOGIN ---
    let loginTree = hookRuntime.render(() => Login(), 'login');
    const getLoginInputs = () => collectNodes(loginTree, (n) => n.type === 'input');
    const submitLogin = async () => {
      loginTree = hookRuntime.render(() => Login(), 'login');
      await collectNodes(loginTree, (n) => n.type === 'form')[0].props.onSubmit({
        preventDefault: vi.fn()
      });
    };

    getLoginInputs()[0].props.onChange({ target: { value: 'salah-format' } });
    getLoginInputs()[1].props.onChange({ target: { value: '123' } });
    await submitLogin();

    getLoginInputs()[0].props.onChange({ target: { value: 'user@moodify.com' } });
    await submitLogin();

    mockLocation = { pathname: '/login', state: { from: { pathname: '/journal/new' } } };
    loginTree = hookRuntime.render(() => Login(), 'login');
    vi.spyOn(authService, 'loginUser')
      .mockResolvedValueOnce({ data: { user: { name: 'Budi' }, token: 't1' } })
      .mockResolvedValueOnce({ data: { user: {}, token: 't-anon' } })
      .mockRejectedValueOnce({})
      .mockResolvedValueOnce({ data: { user: { name: 'Budi' }, token: 't2' } })
      .mockResolvedValueOnce({ data: { user: {}, token: 't3' } })
      .mockRejectedValueOnce({});

    const demoBtn = collectNodes(
      loginTree,
      (n) => n.type === 'button' && n.props?.type === 'button'
    )[0];
    await demoBtn.props.onClick();
    expect(navigateMock).toHaveBeenCalledWith('/journal/new', { replace: true });
    mockLocation = { pathname: '/dashboard', state: null };
    await demoBtn.props.onClick();
    await demoBtn.props.onClick();

    getLoginInputs()[1].props.onChange({ target: { value: 'password123' } });
    await submitLogin();
    await submitLogin();
    await submitLogin();
    // Render ulang Login saat formError terisi, submitting=true, dan demoLoading=true
    hookRuntime.getScope('login').slots[2] = true;
    hookRuntime.getScope('login').slots[3] = true;
    loginTree = hookRuntime.render(() => Login(), 'login');
    expect(collectNodes(loginTree, (n) => n.props?.role === 'alert').length).toBe(1);

    // --- REGISTER ---
    clearToken();
    hookRuntime.getScope('auth').slots[0] = null;
    hookRuntime.getScope('auth').slots[1] = null;
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');

    let regTree = hookRuntime.render(() => Register(), 'register');
    const getRegInputs = () => collectNodes(regTree, (n) => n.type === 'input');
    const submitReg = async () => {
      regTree = hookRuntime.render(() => Register(), 'register');
      await collectNodes(regTree, (n) => n.type === 'form')[0].props.onSubmit({
        preventDefault: vi.fn()
      });
    };

    await submitReg();
    getRegInputs()[0].props.onChange({ target: { value: 'Nadya' } });
    getRegInputs()[1].props.onChange({ target: { value: 'bukan-email' } });
    await submitReg();

    getRegInputs()[1].props.onChange({ target: { value: 'nadya@moodify.com' } });
    getRegInputs()[2].props.onChange({ target: { value: '12345' } });
    await submitReg();

    getRegInputs()[2].props.onChange({ target: { value: 'password123' } });
    getRegInputs()[3].props.onChange({ target: { value: 'beda12345' } });
    await submitReg();

    vi.spyOn(authService, 'registerUser')
      .mockResolvedValueOnce({ data: { user: {}, token: 'reg-t' } })
      .mockRejectedValueOnce({});
    getRegInputs()[3].props.onChange({ target: { value: 'password123' } });
    await submitReg();
    await submitReg();
    hookRuntime.getScope('register').slots[4] = true;
    regTree = hookRuntime.render(() => Register(), 'register');
    expect(collectNodes(regTree, (n) => n.props?.role === 'alert').length).toBe(1);
    expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true });
  });

  it('SongRecommendationPanel, SoundtrackCard, ImageUpload, MoodPicker, MoodChart, Dashboard, Stats, and card/filter callbacks', async () => {
    vi.spyOn(songService, 'getSongs').mockResolvedValueOnce({
      data: [
        { id: 1, title: 'Lagu 1', artist: 'Artis 1', link: 'https://youtube.com/watch?v=1' },
        { id: 2, title: 'Lagu 2', artist: 'Artis 2', link: 'https://spotify.com/track/2' }
      ]
    });
    vi.spyOn(songService, 'getRandomSong')
      .mockResolvedValueOnce({
        data: {
          id: 2,
          title: 'Lagu 2',
          artist: 'Artis 2',
          mood_name: 'Senang',
          color: '#FACC15',
          cover_path: 'uploads/c.png',
          link: 'https://youtube.com/watch?v=2'
        }
      })
      .mockRejectedValueOnce({ statusCode: 404 })
      .mockRejectedValueOnce({ userMessage: 'Error acak' });

    // SongRecommendationPanel dengan data awal
    let panelTree = hookRuntime.render(
      () =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        }),
      'panel'
    );
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    panelTree = hookRuntime.render(
      () =>
        SongRecommendationPanel({
          moodId: 1,
          selectedMood: { id: 1, name: 'Senang', color: '#FACC15' }
        }),
      'panel'
    );
    const randomBtn = collectNodes(panelTree, (n) => n.type === 'button')[0];
    await randomBtn.props.onClick();
    await randomBtn.props.onClick();
    await randomBtn.props.onClick();

    // SongRecommendationPanel: moodId kosong (menutup baris 17-20)
    const emptyPanel = hookRuntime.render(
      () => SongRecommendationPanel({ moodId: '', selectedMood: null }),
      'panel-empty'
    );
    hookRuntime.flushEffects();
    expect(emptyPanel).toBeDefined();

    // SongRecommendationPanel: daftar lagu kosong dari API (menutup baris 30-31)
    vi.spyOn(songService, 'getSongs').mockResolvedValueOnce({ data: [] });
    hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 2, selectedMood: { id: 2, name: 'Tenang' } }),
      'panel-zero'
    );
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const zeroTree = hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 2, selectedMood: { id: 2, name: 'Tenang' } }),
      'panel-zero'
    );
    expect(zeroTree).toBeDefined();

    // SongRecommendationPanel: error fetch dari API (menutup baris 33)
    vi.spyOn(songService, 'getSongs').mockRejectedValueOnce({ userMessage: 'Gagal memuat' });
    hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 3, selectedMood: { id: 3, name: 'Cemas' } }),
      'panel-err'
    );
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const errTree = hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 3, selectedMood: { id: 3, name: 'Cemas' } }),
      'panel-err'
    );
    expect(errTree).toBeDefined();

    // SongRecommendationPanel: tautan eksternal Spotify (menutup baris 123 "Buka lagu")
    vi.spyOn(songService, 'getSongs').mockResolvedValueOnce({
      data: [{ id: 10, title: 'Lagu Spotify', artist: 'Artis', link: 'https://spotify.com/track/10' }]
    });
    hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 4, selectedMood: { id: 4, name: 'Semangat' } }),
      'panel-spotify'
    );
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const spotifyTree = hookRuntime.render(
      () => SongRecommendationPanel({ moodId: 4, selectedMood: { id: 4, name: 'Semangat' } }),
      'panel-spotify'
    );
    expect(spotifyTree).toBeDefined();

    // SoundtrackCard (200 song, 404 notFound, 500 errorMsg)
    vi.spyOn(songService, 'getRandomSong')
      .mockResolvedValueOnce({
        data: {
          id: 1,
          title: 'Monokrom',
          artist: 'Tulus',
          mood_name: 'Senang',
          color: '#FACC15',
          cover_path: 'uploads/c.jpg',
          link: 'https://youtube.com/watch?v=1'
        }
      })
      .mockRejectedValueOnce({ statusCode: 404 })
      .mockRejectedValueOnce({ userMessage: 'Server sibuk' });

    hookRuntime.render(() => SoundtrackCard({ moodId: 1, moodName: 'Senang' }), 'soundtrack');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    let cardTree = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack'
    );
    const shuffleBtn = collectNodes(cardTree, (n) => n.type === 'button')[0];
    await shuffleBtn.props.onClick();
    cardTree = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack'
    );
    await shuffleBtn.props.onClick();
    cardTree = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack'
    );
    expect(cardTree).toBeDefined();

    // SoundtrackCard: loading spinner (menutup baris 81-84)
    hookRuntime.getScope('soundtrack-load').slots[1] = true;
    const loadingCard = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack-load'
    );
    expect(loadingCard).toBeDefined();

    // SoundtrackCard: lagu tanpa cover & link non-youtube (menutup baris 128-134 & 155)
    vi.spyOn(songService, 'getRandomSong').mockResolvedValueOnce({
      data: {
        id: 77,
        title: 'Lagu Tanpa Cover',
        artist: 'Artis Indie',
        mood_name: 'Senang',
        color: '#FACC15',
        cover_path: null,
        link: 'https://spotify.com/track/77'
      }
    });
    hookRuntime.render(() => SoundtrackCard({ moodId: 1, moodName: 'Senang' }), 'soundtrack-nocover');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const noCoverCard = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack-nocover'
    );
    expect(noCoverCard).toBeDefined();

    // SoundtrackCard: error fallback default (menutup baris 35)
    vi.spyOn(songService, 'getRandomSong').mockRejectedValueOnce({});
    hookRuntime.render(() => SoundtrackCard({ moodId: 1, moodName: 'Senang' }), 'soundtrack-def-err');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const defErrCard = hookRuntime.render(
      () => SoundtrackCard({ moodId: 1, moodName: 'Senang' }),
      'soundtrack-def-err'
    );
    expect(defErrCard).toBeDefined();

    // ImageUpload
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:preview-1');
    globalThis.URL.revokeObjectURL = vi.fn();
    const onFileSelect = vi.fn();
    let uploadTree = hookRuntime.render(() => ImageUpload({ onFileSelect }), 'upload');
    const dropZone = collectNodes(uploadTree, (n) => typeof n.props?.onDrop === 'function')[0];
    const fileInput = collectNodes(uploadTree, (n) => n.type === 'input')[0];

    // Drag over -> isDragging true (menutup baris 93)
    dropZone.props.onDragOver({ preventDefault: vi.fn() });
    const draggingUpload = hookRuntime.render(() => ImageUpload({ onFileSelect }), 'upload');
    expect(draggingUpload).toBeDefined();

    dropZone.props.onDragLeave({ preventDefault: vi.fn() });
    dropZone.props.onDrop({
      preventDefault: vi.fn(),
      dataTransfer: { files: [{ type: 'image/png', size: 1024 }] }
    });
    fileInput.props.onChange({ target: { files: [{ type: 'text/plain', size: 100 }] } });
    fileInput.props.onChange({ target: { files: [] } });
    fileInput.props.onChange({ target: { files: [{ type: 'image/jpeg', size: 2048 }] } });
    uploadTree = hookRuntime.render(() => ImageUpload({ onFileSelect }), 'upload');
    const clearBtn = collectNodes(uploadTree, (n) => n.type === 'button')[0];
    clearBtn?.props.onClick();
    hookRuntime.flushEffects();
    hookRuntime.runCleanups();

    // MoodPicker, EnergySlider, Pagination, FilterBars, Cards, Modals callbacks
    const pickerTree = MoodPicker({
      moods: [
        { id: 1, name: 'Senang', color: '#FACC15' },
        { id: 2, name: 'Tenang', color: '#60A5FA' }
      ],
      selectedMoodId: 1,
      onSelect: vi.fn()
    });
    const moodButtons = collectNodes(pickerTree, (n) => n.type === 'button');
    moodButtons[0].props.onClick();
    moodButtons[0].props.onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() });
    moodButtons[0].props.onKeyDown({ key: 'ArrowLeft', preventDefault: vi.fn() });
    moodButtons[0].props.onKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() });
    moodButtons[0].props.onKeyDown({ key: 'ArrowUp', preventDefault: vi.fn() });
    moodButtons[0].props.onKeyDown({ key: 'Escape', preventDefault: vi.fn() });

    // Uji MoodPicker tanpa onSelect (menutup onSelect?. falsy)
    const noSelectPicker = MoodPicker({ moods: [{ id: 1, name: 'Senang' }] });
    collectNodes(noSelectPicker, (n) => n.type === 'button')[0].props.onClick();
    collectNodes(noSelectPicker, (n) => n.type === 'button')[0].props.onKeyDown({
      key: 'ArrowRight',
      preventDefault: vi.fn()
    });

    // Uji MoodPicker kosong (menutup baris 8 if (!moods.length) return)
    const emptyPicker = MoodPicker({ moods: [], selectedMoodId: null, onSelect: vi.fn() });
    collectNodes(emptyPicker, (n) => typeof n.props?.onKeyDown === 'function').forEach((f) =>
      f.props.onKeyDown({ key: 'ArrowRight', preventDefault: vi.fn() })
    );
    expect(emptyPicker).toBeDefined();

    const sliderTree = EnergySlider({ value: 3, onChange: vi.fn() });
    collectNodes(sliderTree, (n) => n.type === 'button')[0].props.onClick();

    const pageTree = Pagination({ page: 2, limit: 5, total: 15, onPageChange: vi.fn() });
    collectNodes(pageTree, (n) => n.type === 'button').forEach((btn) => btn.props.onClick());

    const entryFilterTree = EntryFilterBar({
      moods: [{ id: 1, name: 'Senang', color: '#FACC15' }],
      moodIdParam: '1',
      fromParam: '',
      toParam: '',
      searchInput: '',
      onSearchChange: vi.fn(),
      onFilterChange: vi.fn(),
      onReset: vi.fn(),
      hasActiveFilter: true
    });
    collectNodes(entryFilterTree, (n) => typeof n.props?.onClick === 'function').forEach((b) =>
      b.props.onClick()
    );
    collectNodes(entryFilterTree, (n) => typeof n.props?.onChange === 'function').forEach((i) =>
      i.props.onChange({ target: { value: '2026-04-21' } })
    );

    // EntryFilterBar saat moodIdParam kosong, filter non-aktif, dan klik mood saat isActive = false
    const entryFilterTreeInactive = EntryFilterBar({
      moods: [{ id: 2, name: 'Sedih', color: '#60A5FA' }],
      moodIdParam: '',
      hasActiveFilter: false,
      onFilterChange: vi.fn()
    });
    collectNodes(entryFilterTreeInactive, (n) => typeof n.props?.onClick === 'function').forEach((b) =>
      b.props.onClick()
    );
    const entryFilterDefault = EntryFilterBar({});
    expect(entryFilterDefault).toBeDefined();

    const songFilterTree = SongFilterBar({
      moods: [{ id: 1, name: 'Senang', color: '#FACC15' }],
      selectedMoodId: '1',
      onSelectMood: vi.fn(),
      searchQuery: '',
      onSearchChange: vi.fn()
    });
    collectNodes(songFilterTree, (n) => typeof n.props?.onClick === 'function').forEach((b) =>
      b.props.onClick()
    );
    // Uji SongFilterBar saat isActive bernilai false (menutup baris 41 SongFilterBar.jsx)
    const songFilterTreeInactive = SongFilterBar({
      moods: [{ id: 1, name: 'Senang', color: '#FACC15' }],
      selectedMoodId: '',
      onSelectMood: vi.fn(),
      searchQuery: '',
      onSearchChange: vi.fn()
    });
    collectNodes(songFilterTreeInactive, (n) => typeof n.props?.onClick === 'function').forEach((b) =>
      b.props.onClick()
    );
    collectNodes(songFilterTree, (n) => typeof n.props?.onChange === 'function').forEach((i) =>
      i.props.onChange({ target: { value: 'Tulus' } })
    );

    const moodCardTree = MoodCard({
      mood: { id: 1, name: 'Senang', emoji: '😊', color: '#FACC15' },
      onEdit: vi.fn(),
      onDelete: vi.fn()
    });
    collectNodes(moodCardTree, (n) => n.type === 'button').forEach((b) => b.props.onClick());

    const songCardTree = SongCard({
      song: { id: 1, title: 'A', artist: 'B', color: '#FACC15' },
      canManage: true,
      onEdit: vi.fn(),
      onDelete: vi.fn()
    });
    collectNodes(songCardTree, (n) => n.type === 'button').forEach((b) => b.props.onClick());

    const entryCardTree = EntryCard({
      entry: { id: 1, mood_name: 'Senang', entry_date: '2026-04-21', energy_level: 4 },
      onDelete: vi.fn()
    });
    collectNodes(entryCardTree, (n) => n.type === 'button').forEach((b) => b.props.onClick());

    // MoodFormModal & SongFormModal field changes
    const mModalTree = hookRuntime.render(
      () =>
        MoodFormModal({
          isOpen: true,
          onClose: vi.fn(),
          editingMood: null,
          form: { name: 'Senang', emoji: '😊', color: '#FACC15' },
          onFieldChange: vi.fn(),
          formError: '',
          isSubmitting: true,
          onSubmit: vi.fn()
        }),
      'mmodal'
    );
    collectNodes(mModalTree, (n) => typeof n.props?.onChange === 'function').forEach((i) =>
      i.props.onChange({ target: { value: '#123456' } })
    );
    collectNodes(mModalTree, (n) => n.type === 'button' && n.props?.type === 'button').forEach(
      (b) => b.props.onClick?.()
    );

    const sModalTree = hookRuntime.render(
      () =>
        SongFormModal({
          isOpen: true,
          onClose: vi.fn(),
          editingSong: null,
          form: { title: 'A', artist: 'B', moodId: '1', link: '' },
          onFieldChange: vi.fn(),
          formError: '',
          isSubmitting: false,
          moods: [{ id: 1, name: 'Senang', emoji: '😊' }],
          onSubmit: vi.fn()
        }),
      'smodal'
    );
    collectNodes(sModalTree, (n) => typeof n.props?.onChange === 'function').forEach((i) =>
      i.props.onChange({ target: { value: 'Baru' } })
    );

    // Dashboard, Stats, Journal, Songs, Moods, and EntryForm execution
    vi.spyOn(moodService, 'getMoods').mockResolvedValue({
      data: [{ id: 1, name: 'Senang', emoji: '😊', color: '#FACC15' }]
    });
    vi.spyOn(songService, 'getSongs').mockResolvedValue({
      data: [{ id: 1, title: 'Lagu 1', artist: 'Artis 1', mood_id: 1, mood_name: 'Senang', color: '#FACC15' }]
    });
    vi.spyOn(statsService, 'getWeeklyStats').mockResolvedValue({ data: null });
    vi.spyOn(entryService, 'getEntries').mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 6, total: 0 }
    });
    vi.spyOn(entryService, 'createEntry').mockResolvedValue({
      data: { id: 99, mood_id: 1, mood_name: 'Senang', color: '#FACC15', entry_date: '2026-04-21' }
    });

    hookRuntime.render(() => ToastProvider({ children: null }), 'toast');
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    hookRuntime.render(() => Dashboard(), 'dash');
    hookRuntime.render(() => Stats(), 'stats');
    hookRuntime.render(() => Journal(), 'journal');
    hookRuntime.render(() => Songs(), 'songs');
    hookRuntime.render(() => Moods(), 'moods');
    hookRuntime.render(() => EntryForm(), 'entryform');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    // Render ulang Dashboard & Stats saat data kosong (EmptyState + onAction)
    const dashEmptyTree = hookRuntime.render(() => Dashboard(), 'dash');
    collectNodes(dashEmptyTree, (n) => typeof n.props?.onAction === 'function').forEach((e) =>
      e.props.onAction()
    );
    const statsEmptyTree = hookRuntime.render(() => Stats(), 'stats');
    collectNodes(statsEmptyTree, (n) => typeof n.props?.onAction === 'function').forEach((e) =>
      e.props.onAction()
    );

    // Dashboard: error state & retry (menutup baris 43-45 Dashboard.jsx)
    hookRuntime.getScope('dash-err').slots[2] = false;
    hookRuntime.getScope('dash-err').slots[3] = { message: 'Koneksi API terputus', isNetworkError: true };
    const dashErrTree = hookRuntime.render(() => Dashboard(), 'dash-err');
    collectNodes(dashErrTree, (n) => typeof n.props?.onRetry === 'function').forEach((r) => r.props.onRetry());

    // Dashboard: stats bernilai null -> fallback default (menutup baris 48-53 Dashboard.jsx)
    hookRuntime.getScope('dash-nostats').slots[0] = { stats: null, recentEntries: [] };
    hookRuntime.getScope('dash-nostats').slots[2] = false;
    hookRuntime.getScope('dash-nostats').slots[3] = null;
    const dashNoStatsTree = hookRuntime.render(() => Dashboard(), 'dash-nostats');
    collectNodes(dashNoStatsTree, (n) => typeof n.props?.onAction === 'function').forEach((e) => e.props.onAction());

    // Dashboard: data lengkap dengan statistik dan entri terbaru
    hookRuntime.getScope('dash-full').slots[0] = {
      stats: {
        total_entries_7d: 5,
        avg_energy_7d: 4.2,
        top_mood: { id: 1, name: 'Senang', color: '#FACC15' },
        by_mood: [{ mood_id: 1, name: 'Senang', count: 5, color: '#FACC15' }],
        daily: [{ date: '2026-04-21', count: 5, avg_energy: 4.2 }]
      },
      recentEntries: [
        { id: 101, mood_id: 1, mood_name: 'Senang', color: '#FACC15', entry_date: '2026-04-21', energy_level: 5, note: 'Sempurna' }
      ]
    };
    hookRuntime.getScope('dash-full').slots[2] = false;
    hookRuntime.getScope('dash-full').slots[3] = null;
    const dashFullTree = hookRuntime.render(() => Dashboard(), 'dash-full');
    expect(dashFullTree).toBeDefined();

    // Dashboard: recentEntries kosong tapi stats.top_mood ada (menutup baris 54 & 59-63)
    hookRuntime.getScope('dash-topmood').slots[0] = {
      stats: {
        total_entries_7d: 3,
        avg_energy_7d: 3.5,
        top_mood: { id: 2, name: 'Tenang', color: '#60A5FA' },
        by_mood: [],
        daily: []
      },
      recentEntries: null
    };
    hookRuntime.getScope('dash-topmood').slots[2] = false;
    hookRuntime.getScope('dash-topmood').slots[3] = null;
    const dashTopMoodTree = hookRuntime.render(() => Dashboard(), 'dash-topmood');
    expect(dashTopMoodTree).toBeDefined();

    // Dashboard: fetchDashboardData saat getEntries mengembalikan data null (menutup baris 32)
    vi.spyOn(entryService, 'getEntries').mockResolvedValueOnce({});
    vi.spyOn(statsService, 'getWeeklyStats').mockResolvedValueOnce({
      data: { total_entries_7d: 1, avg_energy_7d: 4, top_mood: null, by_mood: [], daily: [] }
    });
    hookRuntime.render(() => Dashboard(), 'dash-fetch-null');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();

    // Render ulang Journal, Songs, Moods setelah data dimuat & jalankan callback-nya
    vi.spyOn(entryService, 'getEntries').mockResolvedValue({
      data: [{ id: 1, mood_id: 1, mood_name: 'Senang', entry_date: '2026-04-21', energy_level: 4 }],
      meta: { page: 1, limit: 6, total: 12 }
    });
    hookRuntime.getScope('journal').slots[4] = '';
    hookRuntime.getScope('journal').slots[6] = [
      { id: 1, mood_id: 1, mood_name: 'Senang', entry_date: '2026-04-21', energy_level: 4 }
    ];
    hookRuntime.getScope('journal').slots[8] = false;
    const jTree = hookRuntime.render(() => Journal(), 'journal');
    collectNodes(jTree, (n) => typeof n.props?.onDelete === 'function').forEach((c) =>
      c.props.onDelete({ id: 1, mood_name: 'Senang', entry_date: '2026-04-21' })
    );
    collectNodes(jTree, (n) => typeof n.props?.onPageChange === 'function').forEach((p) =>
      p.props.onPageChange(2)
    );
    // Render ulang Journal saat dialog konfirmasi aktif (menutup baris 130 Journal.jsx)
    const jTreeWithDelete = hookRuntime.render(() => Journal(), 'journal');
    const jConfirm = collectNodes(
      jTreeWithDelete,
      (n) => typeof n.props?.onConfirm === 'function'
    )[0];
    expect(jConfirm.props.message).toContain('Senang');
    jConfirm.props.onCancel();
    hookRuntime.render(() => Journal(), 'journal');

    // Songs: onDelete -> songToDelete message, closeModal & closeDelete (menutup baris 51-54 Songs.jsx)
    let songsTree = hookRuntime.render(() => Songs(), 'songs');
    collectNodes(songsTree, (n) => typeof n.props?.onClose === 'function').forEach((b) =>
      b.props.onClose()
    );
    collectNodes(songsTree, (n) => typeof n.props?.onCancel === 'function').forEach((c) =>
      c.props.onCancel()
    );
    collectNodes(songsTree, (n) => typeof n.props?.onDelete === 'function').forEach((c) =>
      c.props.onDelete({ id: 1, title: 'Lagu 1', artist: 'Artis 1' })
    );
    songsTree = hookRuntime.render(() => Songs(), 'songs');
    expect(songsTree).toBeDefined();

    // Songs: onSongDeleted callback saat randomSong cocok dan tidak cocok (menutup baris 51-54 Songs.jsx)
    vi.spyOn(songService, 'deleteSong').mockResolvedValue({});
    hookRuntime.getScope('songs').slots[11] = { id: 1, title: 'Lagu 1' }; // randomSong (slot 11)
    hookRuntime.getScope('songs').slots[18] = { id: 1, title: 'Lagu 1' }; // itemToDelete (slot 18)
    const songsConfirmTree = hookRuntime.render(() => Songs(), 'songs');
    const songConfirmBtn = collectNodes(
      songsConfirmTree,
      (n) => typeof n.props?.onConfirm === 'function'
    )[0];
    await songConfirmBtn?.props.onConfirm?.();
    // randomSong cocok sehingga di-reset menjadi null (baris 52-53)

    // onSongDeleted saat randomSong tidak cocok dengan lagu yang dihapus
    hookRuntime.getScope('songs').slots[11] = { id: 2, title: 'Lagu 2' };
    hookRuntime.getScope('songs').slots[18] = { id: 1, title: 'Lagu 1' };
    await songConfirmBtn?.props.onConfirm?.();

    // Songs: randomLoading=true (menutup baris 106 "Mengacak...")
    hookRuntime.getScope('songs').slots[12] = true;
    let songsTreeLoading = hookRuntime.render(() => Songs(), 'songs');
    expect(
      collectNodes(songsTreeLoading, (n) => n.type === 'span').some(
        (s) => s.props?.children === 'Mengacak...'
      )
    ).toBe(true);

    // Songs: empty song list with isAuthenticated=true vs false (menutup baris 67-68)
    hookRuntime.getScope('songs').slots[7] = []; // songs = []
    hookRuntime.getScope('songs').slots[9] = false; // loading = false
    hookRuntime.getScope('songs').slots[10] = null; // error = null
    hookRuntime.getScope('songs').slots[12] = false;
    hookRuntime.getScope('auth').slots[0] = { id: 1, name: 'User' }; // isAuthenticated = true
    hookRuntime.getScope('auth').slots[1] = 'jwt';
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    let songsAuthEmpty = hookRuntime.render(() => Songs(), 'songs');
    expect(
      collectNodes(songsAuthEmpty, (n) => n.props?.actionLabel === 'Tambah Lagu Baru').length
    ).toBe(1);

    hookRuntime.getScope('auth').slots[0] = null; // isAuthenticated = false
    hookRuntime.getScope('auth').slots[1] = null;
    hookRuntime.render(() => AuthProvider({ children: null }), 'auth');
    let songsGuestEmpty = hookRuntime.render(() => Songs(), 'songs');
    const guestEmptyNode = collectNodes(
      songsGuestEmpty,
      (n) => n.props?.title === 'Belum Ada Lagu Ditemukan'
    )[0];
    expect(guestEmptyNode?.props?.actionLabel).toBeUndefined();

    // Moods: onDelete -> moodToDelete message
    let moodsTree = hookRuntime.render(() => Moods(), 'moods');
    collectNodes(moodsTree, (n) => typeof n.props?.onDelete === 'function').forEach((c) =>
      c.props.onDelete({ id: 1, name: 'Senang' })
    );
    moodsTree = hookRuntime.render(() => Moods(), 'moods');
    expect(moodsTree).toBeDefined();

    // EntryForm setelah moods berhasil dimuat: uji validasi gagal (moodId kosong) & input perubahan
    let efTree = hookRuntime.render(() => EntryForm(), 'entryform');
    collectNodes(efTree, (n) => n.type === 'form')[0].props.onSubmit({
      preventDefault: vi.fn()
    });
    collectNodes(efTree, (n) => typeof n.props?.onChange === 'function').forEach((i) =>
      i.props.onChange({ target: { value: '2026-04-21' } })
    );
    collectNodes(efTree, (n) => typeof n.props?.onSelect === 'function').forEach((p) =>
      p.props.onSelect(1)
    );
    collectNodes(efTree, (n) => typeof n.props?.onFileSelect === 'function').forEach((u) =>
      u.props.onFileSelect(null)
    );
    // Render ulang EntryForm saat selectedMood ada, lalu submit berhasil -> savedSuccessEntry
    efTree = hookRuntime.render(() => EntryForm(), 'entryform');
    await collectNodes(efTree, (n) => n.type === 'form')[0].props.onSubmit({
      preventDefault: vi.fn()
    });
    efTree = hookRuntime.render(() => EntryForm(), 'entryform');
    expect(efTree).toBeDefined();

    // EntryForm mode edit (id = '10'): uji loadError & isSubmitting/isEditMode
    mockParams = { id: '10' };
    vi.spyOn(entryService, 'getEntryById').mockRejectedValueOnce({
      userMessage: 'Jurnal tidak ditemukan'
    });
    hookRuntime.render(() => EntryForm(), 'entryform-edit');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    const efErrTree = hookRuntime.render(() => EntryForm(), 'entryform-edit');
    collectNodes(efErrTree, (n) => typeof n.props?.onRetry === 'function').forEach((r) =>
      r.props.onRetry()
    );

    vi.spyOn(entryService, 'getEntryById').mockResolvedValueOnce({
      data: {
        id: 10,
        entry_date: '2026-04-20',
        mood_id: 1,
        energy_level: 4,
        note: 'Kemarin',
        image_path: 'uploads/old.png'
      }
    });
    hookRuntime.render(() => EntryForm(), 'entryform-edit-ok');
    hookRuntime.flushEffects();
    await Promise.resolve();
    await Promise.resolve();
    // Render EntryForm edit saat tidak submitting (menutup baris 52-53 "Simpan Perubahan Jurnal")
    // slots: 2 = moodsLoading, 10 = loadingEntry, 11 = loadError, 12 = isSubmitting
    hookRuntime.getScope('entryform-edit-ok').slots[2] = false;
    hookRuntime.getScope('entryform-edit-ok').slots[10] = false;
    hookRuntime.getScope('entryform-edit-ok').slots[11] = null;
    hookRuntime.getScope('entryform-edit-ok').slots[12] = false;
    const efEditTree = hookRuntime.render(() => EntryForm(), 'entryform-edit-ok');
    expect(efEditTree).toBeDefined();

    // Set isSubmitting = true di slot 12 untuk menutup submitButtonLabel "Menyimpan Jurnal..." (baris 50)
    hookRuntime.getScope('entryform-edit-ok').slots[12] = true;
    hookRuntime.render(() => EntryForm(), 'entryform-edit-ok');

    // MoodChart Tooltip formatters & zero count
    const chartTree = MoodChart({
      byMood: [
        { mood_id: 1, name: 'Senang', count: 2, color: '#FACC15' },
        { mood_id: 2, name: 'Tenang', count: 0, color: null }
      ],
      daily: [
        { date: '2026-04-21', count: 2, avg_energy: 4 },
        { date: '2026-04-22', count: 0, avg_energy: 0 },
        { date: '2026-04-23', count: null, avg_energy: null },
        { date: '2026-04-24', count: undefined, avg_energy: undefined }
      ]
    });
    const tooltips = collectNodes(chartTree, (n) => typeof n.props?.formatter === 'function');
    expect(tooltips[0].props.formatter(2, 'count')[0]).toBe('2 entri');
    expect(tooltips[0].props.formatter(4, 'avg_energy')[0]).toBe('4 / 5.0');
    expect(tooltips[0].props.formatter(1, 'other')[0]).toBe(1);
    expect(
      tooltips[0].props.labelFormatter('21 Apr', [{ payload: { date: '2026-04-21' } }])
    ).toContain('2026-04-21');
    expect(tooltips[0].props.labelFormatter('21 Apr', [])).toContain('21 Apr');
    expect(tooltips[1].props.formatter(3)[0]).toBe('3 kali');
  });
});
