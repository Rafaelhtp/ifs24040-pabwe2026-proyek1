// Komponen Error Boundary untuk menangkap crash runtime React dan menampilkan UI fallback ramah pengguna
import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Mencatat detail error untuk keperluan debugging
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReload = () => {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-frost p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-frost-border shadow-soft-lg text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center font-black text-2xl">
              !
            </div>
            <h1 className="text-xl font-extrabold text-ink">Terjadi Kesalahan Aplikasi</h1>
            <p className="text-sm font-bold text-denim-dark">
              Maaf, terjadi masalah tak terduga. Silakan muat ulang halaman.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-2xl bg-denim text-white font-extrabold text-sm hover:bg-denim-dark transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  onError: PropTypes.func
};
