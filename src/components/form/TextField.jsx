// Komponen input teks reusable dengan label, ikon opsional, dan atribut aksesibilitas
import React from 'react';
import PropTypes from 'prop-types';

export default function TextField({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
  icon: Icon,
  hasError = false,
  describedBy
}) {
  const inputPadding = Icon ? 'pl-10 pr-4' : 'px-3.5';

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-xs font-extrabold text-ink mb-1">
          <span>{label}</span>
          {required && <span className="text-rose-500"> *</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="w-4 h-4 text-ink-soft absolute left-3.5 top-3" aria-hidden="true" />
        )}
        <input
          id={id}
          name={name || id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={Boolean(hasError)}
          aria-describedby={describedBy}
          className={`w-full ${inputPadding} py-2.5 rounded-2xl border border-frost-border text-sm text-ink bg-frost/30 focus:bg-white`}
        />
      </div>
    </div>
  );
}

TextField.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  autoComplete: PropTypes.string,
  icon: PropTypes.elementType,
  hasError: PropTypes.bool,
  describedBy: PropTypes.string
};
