import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import { ToastProvider, useToast } from '../../components/common/Toast';

function ProblemChild({ shouldThrow = false }) {
  if (shouldThrow) {
    throw new Error('Test crash runtime');
  }
  return <div>Komponen Anak Normal</div>;
}

describe('ErrorBoundary component', () => {
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Komponen Anak Normal')).toBeTruthy();
  });

  it('renders default error fallback UI and triggers reload on button click', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: reloadMock }
    });

    const onErrorMock = vi.fn();
    render(
      <ErrorBoundary onError={onErrorMock}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Terjadi Kesalahan Aplikasi')).toBeTruthy();
    expect(
      screen.getByText('Maaf, terjadi masalah tak terduga. Silakan muat ulang halaman.')
    ).toBeTruthy();
    expect(onErrorMock).toHaveBeenCalled();

    const reloadBtn = screen.getByRole('button', { name: /muat ulang halaman/i });
    fireEvent.click(reloadBtn);
    expect(reloadMock).toHaveBeenCalled();
  });

  it('renders custom fallback prop when error occurs', () => {
    render(
      <ErrorBoundary fallback={<div>Fallback Kustom Error</div>}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Fallback Kustom Error')).toBeTruthy();
  });
});

describe('Toast crypto.randomUUID fallback', () => {
  it('falls back to Math.random when crypto.randomUUID is unavailable', () => {
    const originalCrypto = globalThis.crypto;
    // Simulate legacy browser where randomUUID is not defined
    Object.defineProperty(globalThis, 'crypto', {
      writable: true,
      value: undefined
    });

    const wrapper = ({ children }) => <ToastProvider>{children}</ToastProvider>;
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.showToast('Pesan toast fallback ID', 'info');
    });

    expect(screen.getByText('Pesan toast fallback ID')).toBeTruthy();

    // Restore crypto
    Object.defineProperty(globalThis, 'crypto', {
      writable: true,
      value: originalCrypto
    });
  });
});
