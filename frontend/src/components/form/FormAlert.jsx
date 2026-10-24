// Komponen pesan peringatan/error pada formulir dengan dukungan aksesibilitas role="alert"
import React from 'react';
import PropTypes from 'prop-types';

export default function FormAlert({ id, message }) {
  if (!message) return null;

  return (
    <div
      id={id}
      role="alert"
      className="px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800"
    >
      {message}
    </div>
  );
}

FormAlert.propTypes = {
  id: PropTypes.string,
  message: PropTypes.string
};
