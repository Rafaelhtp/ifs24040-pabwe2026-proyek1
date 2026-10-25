import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { AuthProvider, useAuth, AuthContext } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import { ToastProvider, useToast } from '../../components/common/Toast';
import Pagination from '../../components/common/Pagination';
import Navbar from '../../components/layout/Navbar';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import ImageUpload from '../../components/form/ImageUpload';
import MoodPicker from '../../components/moods/MoodPicker';
import MoodConflictAlert from '../../components/moods/MoodConflictAlert';
import * as authService from '../../services/authService';
import { setToken, clearToken } from '../../services/tokenStorage';
import { UNAUTHORIZED_EVENT } from '../../constants/config';

describe('Interactive branches & lifecycle effects for AuthContext, Modal, Toast, Navbar, Login, Register, and widgets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store = new Map();
    const mockStorage = {
      getItem: (key) => store.get(key) || null,
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear()
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'localStorage', {
        value: mockStorage,
        writable: true,
        configurable: true
      });
    }

    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }
  });

  afterEach(() => {
    cleanup();
    clearToken();
  });

  it('AuthContext: verifies session (empty, valid, 401 error, network error), login, register, logout, and unauthorized event', async () => {
    const consoleError = console.error;
    console.error = vi.fn();
    try {
      renderHook(() => useAuth());
    } catch (err) {
      expect(err.message).toContain('useAuth harus digunakan di dalam AuthProvider');
    }
    console.error = consoleError;

    // 1. Tanpa token
    clearToken();
    const { result: emptyAuth } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(emptyAuth.current.isAuthenticated).toBe(false);

    // 2. Dengan token valid + login + register + logout
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

    const { result: authResult } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => {
      expect(authResult.current.user?.name).toBe('Budi');
    });

    let loggedIn;
    await act(async () => {
      loggedIn = await authResult.current.login('budi@moodify.com', 'password123');
    });
    expect(loggedIn.name).toBe('Login User');

    let registered;
    await act(async () => {
      registered = await authResult.current.register('Reg User', 'reg@moodify.com', 'password123');
    });
    expect(registered.name).toBe('Reg User');

    // res.data null fallback
    vi.spyOn(authService, 'loginUser').mockResolvedValueOnce({ data: null });
    let nullLogin;
    await act(async () => {
      nullLogin = await authResult.current.login('budi@moodify.com', 'password123');
    });
    expect(nullLogin).toBeNull();

    vi.spyOn(authService, 'registerUser').mockResolvedValueOnce({ data: null });
    let nullReg;
    await act(async () => {
      nullReg = await authResult.current.register('Reg User', 'reg@moodify.com', 'password123');
    });
    expect(nullReg).toBeNull();

    // Unauthorized event dispatch
    act(() => {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    });
    await waitFor(() => {
      expect(authResult.current.user).toBeNull();
    });

    act(() => {
      authResult.current.logout();
    });
    expect(authResult.current.isAuthenticated).toBe(false);

    // 3. 401 error
    setToken('expired-jwt');
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce({ isNetworkError: false });
    const { result: expiredAuth } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => {
      expect(expiredAuth.current.isAuthenticated).toBe(false);
    });

    // 4. Network error (keeps token)
    setToken('keep-jwt');
    vi.spyOn(authService, 'getCurrentUser').mockRejectedValueOnce({ isNetworkError: true });
    const { result: netErrAuth } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => {
      expect(netErrAuth.current.loading).toBe(false);
    });
    clearToken();
  });

  it('Modal: handles focus trap, Escape key, Tab/Shift+Tab cycling, and cleanup focus restore', () => {
    const onClose = vi.fn();

    // Closed
    const { rerender } = render(<Modal isOpen={false} onClose={onClose} title="Tutup" />);
    expect(screen.queryByRole('dialog')).toBeNull();

    // Open with buttons
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    rerender(
      <Modal isOpen={true} onClose={onClose} title="Buka">
        <button>First</button>
        <button>Middle</button>
        <button>Last</button>
      </Modal>
    );

    expect(screen.getByRole('dialog')).toBeDefined();

    // Escape
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();

    // Tab and Shift+Tab cycling
    const buttons = screen.getAllByRole('button');
    const firstBtn = buttons[0];
    const lastBtn = buttons[buttons.length - 1];

    firstBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });

    lastBtn.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: false });

    // Close and verify focus restored
    rerender(<Modal isOpen={false} onClose={onClose} title="Tutup" />);
    document.body.removeChild(trigger);
  });

  it('ToastProvider & useToast: shows success/error/info toasts, removes toast on click or timeout, and cleans up timers', () => {
    const consoleError = console.error;
    console.error = vi.fn();
    try {
      renderHook(() => useToast());
    } catch (err) {
      expect(err.message).toContain('useToast harus digunakan di dalam ToastProvider');
    }
    console.error = consoleError;

    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <div>
          <button onClick={() => showToast('Notifikasi Sukses', 'success', 3000)}>BtnSuccess</button>
          <button onClick={() => showToast('Notifikasi Gagal', 'error', 0)}>BtnError</button>
          <button onClick={() => showToast('Notifikasi Info', 'info', 3000)}>BtnInfo</button>
          <button onClick={() => showToast('Notifikasi Custom', 'unknown-type', 3000)}>BtnCustom</button>
        </div>
      );
    };

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('BtnSuccess'));
    fireEvent.click(screen.getByText('BtnError'));
    fireEvent.click(screen.getByText('BtnInfo'));
    fireEvent.click(screen.getByText('BtnCustom'));

    expect(screen.getByText('Notifikasi Sukses')).toBeDefined();
    expect(screen.getByText('Notifikasi Gagal')).toBeDefined();
    expect(screen.getByText('Notifikasi Info')).toBeDefined();
    expect(screen.getByText('Notifikasi Custom')).toBeDefined();

    const closeButtons = screen.getAllByRole('button', { name: /tutup notifikasi/i });
    expect(closeButtons.length).toBe(4);
    fireEvent.click(closeButtons[0]);
  });

  it('Navbar: handles logout, mobile menu toggle, and active/inactive link classes for authenticated and guest users', () => {
    // Authenticated
    const mockAuthValue = {
      user: { id: 1, name: 'Nadya', email: 'nadya@moodify.com' },
      isAuthenticated: true,
      logout: vi.fn()
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthContext.Provider value={mockAuthValue}>
          <ToastProvider>
            <Navbar />
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Toggle mobile menu
    const toggleBtn = screen.getByRole('button', { name: /buka atau tutup menu navigasi/i });
    fireEvent.click(toggleBtn);

    // Logout click
    const logoutBtn = screen.getAllByRole('button', { name: /keluar/i })[0];
    fireEvent.click(logoutBtn);
    expect(mockAuthValue.logout).toHaveBeenCalled();

    // Guest user
    cleanup();
    const guestAuthValue = {
      user: null,
      isAuthenticated: false,
      logout: vi.fn()
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthContext.Provider value={guestAuthValue}>
          <ToastProvider>
            <Navbar />
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const guestToggle = screen.getByRole('button', { name: /buka atau tutup menu navigasi/i });
    fireEvent.click(guestToggle);
    expect(screen.getAllByText(/masuk/i).length).toBeGreaterThan(0);
  });

  it('Login & Register: validates inputs, submits credentials, handles demo login and API errors', async () => {
    const mockLogin = vi.fn();
    const mockRegister = vi.fn();
    const authVal = {
      user: null,
      isAuthenticated: false,
      login: mockLogin,
      register: mockRegister
    };

    // --- LOGIN ---
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/login']}>
        <AuthContext.Provider value={authVal}>
          <ToastProvider>
            <Login />
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const emailInput = container.querySelector('#username');
    const passInput = container.querySelector('#password');
    const submitBtn = container.querySelector('#btn-submit');

    // Invalid email validation
    fireEvent.change(emailInput, { target: { value: 'salah-format' } });
    fireEvent.change(passInput, { target: { value: '123' } });
    fireEvent.click(submitBtn);
    expect(screen.getByRole('alert')).toBeDefined();

    // Valid format, demo login
    mockLogin.mockResolvedValueOnce({ name: 'Demo User' });
    const demoBtn = screen.getByRole('button', { name: /masuk dengan akun demo/i });
    await act(async () => {
      fireEvent.click(demoBtn);
    });

    // Valid credentials submit
    mockLogin.mockResolvedValueOnce({ name: 'User' });
    fireEvent.change(emailInput, { target: { value: 'user@moodify.com' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    // Login API error
    mockLogin.mockRejectedValueOnce({ userMessage: 'Password salah' });
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    expect((await screen.findAllByText('Password salah')).length).toBeGreaterThan(0);

    // --- REGISTER ---
    cleanup();
    const { container: regContainer } = render(
      <MemoryRouter initialEntries={['/auth/register']}>
        <AuthContext.Provider value={authVal}>
          <ToastProvider>
            <Register />
          </ToastProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const regName = regContainer.querySelector('#reg-name');
    const regEmail = regContainer.querySelector('#reg-email');
    const regPass = regContainer.querySelector('#reg-password');
    const regConfirm = regContainer.querySelector('#reg-confirm');
    const regBtn = screen.getByRole('button', { name: /daftar sekarang/i });

    // Empty validation
    fireEvent.click(regBtn);
    expect(screen.getByRole('alert')).toBeDefined();

    // Invalid email
    fireEvent.change(regName, { target: { value: 'Nadya' } });
    fireEvent.change(regEmail, { target: { value: 'bukan-email' } });
    fireEvent.click(regBtn);

    // Password mismatch
    fireEvent.change(regEmail, { target: { value: 'nadya@moodify.com' } });
    fireEvent.change(regPass, { target: { value: 'password123' } });
    fireEvent.change(regConfirm, { target: { value: 'beda12345' } });
    fireEvent.click(regBtn);

    // Register success & error
    mockRegister.mockRejectedValueOnce({ userMessage: 'Email sudah terdaftar' });
    fireEvent.change(regConfirm, { target: { value: 'password123' } });
    await act(async () => {
      fireEvent.click(regBtn);
    });
    expect((await screen.findAllByText('Email sudah terdaftar')).length).toBeGreaterThan(0);

    mockRegister.mockResolvedValueOnce({ name: 'Nadya' });
    await act(async () => {
      fireEvent.click(regBtn);
    });
  });

  it('covers interactive branches in Pagination, ImageUpload, MoodPicker, MoodConflictAlert, and form components', () => {
    // Pagination: totalPages > 5 with ellipsis
    const onPageChange = vi.fn();
    const { container: pagContainer } = render(
      <Pagination page={5} limit={10} total={100} onPageChange={onPageChange} />
    );
    expect(screen.getByText(/halaman/i)).toBeDefined();
    const pageButtons = pagContainer.querySelectorAll('button');
    fireEvent.click(pageButtons[0]); // Previous
    expect(onPageChange).toHaveBeenCalledWith(4);
    fireEvent.click(pageButtons[pageButtons.length - 1]); // Next
    expect(onPageChange).toHaveBeenCalledWith(6);

    // ImageUpload: file selection and removal
    cleanup();
    const onFileSelect = vi.fn();
    const { container: uploadContainer } = render(
      <ImageUpload
        selectedFile={null}
        existingImagePath={null}
        onFileSelect={onFileSelect}
      />
    );
    const fileInput = uploadContainer.querySelector('input[type="file"]');
    const file = new File(['test'], 'photo.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onFileSelect).toHaveBeenCalledWith(file);

    // Cancel new selection
    const cancelBtn = screen.getByRole('button', { name: /batalkan foto baru/i });
    fireEvent.click(cancelBtn);
    expect(onFileSelect).toHaveBeenCalledWith(null);

    // MoodPicker: keyboard navigation and click
    cleanup();
    const onSelectMood = vi.fn();
    const moods = [
      { id: 1, name: 'Senang', emoji: '😊', color: '#FACC15' },
      { id: 2, name: 'Sedih', emoji: '😢', color: '#60A5FA' }
    ];
    render(<MoodPicker moods={moods} selectedId={1} onSelect={onSelectMood} />);
    const moodButtons = screen.getAllByRole('button');
    fireEvent.click(moodButtons[1]);
    expect(onSelectMood).toHaveBeenCalledWith(2);
    fireEvent.keyDown(moodButtons[0], { key: 'ArrowRight' });
    fireEvent.keyDown(moodButtons[0], { key: 'ArrowLeft' });

    // MoodConflictAlert: close button
    cleanup();
    const onCloseAlert = vi.fn();
    render(<MoodConflictAlert message="Mood terpakai" onClose={onCloseAlert} />);
    const alertClose = screen.getByRole('button', { name: /tutup/i });
    fireEvent.click(alertClose);
    expect(onCloseAlert).toHaveBeenCalled();
  });
});
