// Komponen SVG Ilustrasi Karakter Blob Organik (Mochi/Pebble) sesuai Nama & Warna Mood API
import React from 'react';
import PropTypes from 'prop-types';

const SIZE_MAP = {
  xs: 28,
  sm: 40,
  md: 56,
  lg: 76,
  xl: 96
};

// Konfigurasi bentuk blob asimetris & warna pastel untuk 7 mood utama
const MOOD_PRESETS = {
  senang: {
    fill: '#FDE68A',
    defaultStroke: '#FACC15',
    path: 'M50 10 C75 9, 91 26, 90 51 C89 76, 74 90, 49 90 C24 90, 10 75, 11 50 C12 25, 25 11, 50 10 Z'
  },
  tenang: {
    fill: '#BAE6FD',
    defaultStroke: '#60A5FA',
    path: 'M51 14 C77 15, 92 31, 91 54 C90 77, 73 89, 49 89 C25 89, 9 76, 10 53 C11 30, 25 13, 51 14 Z'
  },
  semangat: {
    fill: '#FDBA74',
    defaultStroke: '#F97316',
    path: 'M50 6 C72 6, 88 26, 87 52 C86 77, 72 91, 50 91 C28 91, 13 77, 13 52 C13 26, 28 6, 50 6 Z'
  },
  sedih: {
    fill: '#BFDBFE',
    defaultStroke: '#6366F1',
    path: 'M50 15 C71 15, 86 35, 90 60 C93 80, 77 91, 50 91 C23 91, 7 80, 10 60 C14 35, 29 15, 50 15 Z'
  },
  cemas: {
    fill: '#DDD6FE',
    defaultStroke: '#A78BFA',
    path: 'M46 11 C70 8, 91 24, 88 48 C85 72, 76 90, 52 89 C27 88, 9 74, 12 49 C15 24, 24 14, 46 11 Z'
  },
  marah: {
    fill: '#FDA4AF',
    defaultStroke: '#EF4444',
    path: 'M50 18 C78 17, 92 29, 91 54 C90 78, 74 90, 50 90 C26 90, 10 78, 9 54 C8 29, 22 19, 50 18 Z'
  },
  lelah: {
    fill: '#CBD5E1',
    defaultStroke: '#94A3B8',
    path: 'M50 24 C79 24, 94 38, 93 59 C92 80, 75 90, 50 90 C25 90, 8 80, 7 59 C6 38, 21 24, 50 24 Z'
  }
};

const DEFAULT_PATH =
  'M50 12 C75 11, 90 28, 90 51 C90 75, 74 90, 50 90 C26 90, 10 75, 10 51 C10 28, 25 13, 50 12 Z';

export default function MoodBlob({
  moodName = 'Mood',
  color = '#5798D7',
  size = 'md',
  selected = false,
  animated = false,
  className = ''
}) {
  const normalized = String(moodName || '')
    .toLowerCase()
    .trim();
  const preset = MOOD_PRESETS[normalized];
  const pixelSize = typeof size === 'number' ? size : SIZE_MAP[size] || SIZE_MAP.md;

  const strokeColor = color || preset?.defaultStroke || '#5798D7';
  const blobPath = preset ? preset.path : DEFAULT_PATH;

  const animClasses = [
    'mood-blob-interactive inline-block shrink-0 select-none',
    selected ? 'mood-blob-selected' : '',
    animated ? 'mood-blob-pop' : '',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const renderFace = () => {
    switch (normalized) {
      case 'senang':
        return (
          <g
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M31 44 L38 48 L31 52" />
            <path d="M69 44 L62 48 L69 52" />
            <ellipse
              cx="26"
              cy="56"
              rx="4.5"
              ry="2.5"
              fill="#F97316"
              fillOpacity="0.35"
              stroke="none"
            />
            <ellipse
              cx="74"
              cy="56"
              rx="4.5"
              ry="2.5"
              fill="#F97316"
              fillOpacity="0.35"
              stroke="none"
            />
            <path d="M41 56 Q50 67 59 56 Z" fill="#F87171" stroke="#1E293B" strokeWidth="2.8" />
          </g>
        );

      case 'tenang':
        return (
          <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M30 49 Q35 54 40 49" />
            <path d="M60 49 Q65 54 70 49" />
            <ellipse
              cx="27"
              cy="56"
              rx="4"
              ry="2"
              fill="#38BDF8"
              fillOpacity="0.35"
              stroke="none"
            />
            <ellipse
              cx="73"
              cy="56"
              rx="4"
              ry="2"
              fill="#38BDF8"
              fillOpacity="0.35"
              stroke="none"
            />
            <path d="M43 60 Q52 63 59 57" />
          </g>
        );

      case 'semangat':
        return (
          <g
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <circle cx="35" cy="45" r="4.2" fill="#1E293B" stroke="none" />
            <circle cx="33.5" cy="43.5" r="1.5" fill="#FFFFFF" stroke="none" />
            <circle cx="65" cy="45" r="4.2" fill="#1E293B" stroke="none" />
            <circle cx="63.5" cy="43.5" r="1.5" fill="#FFFFFF" stroke="none" />
            <path
              d="M77 24 L79 29 L84 31 L79 33 L77 38 L75 33 L70 31 L75 29 Z"
              fill="#FACC15"
              stroke="none"
            />
            <path d="M37 55 Q50 70 63 55 Z" fill="#FB7185" stroke="#1E293B" strokeWidth="2.8" />
          </g>
        );

      case 'sedih':
        return (
          <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M29 45 Q34 42 39 46" strokeWidth="2.4" />
            <path d="M71 45 Q66 42 61 46" strokeWidth="2.4" />
            <circle cx="35" cy="51" r="3.2" fill="#1E293B" stroke="none" />
            <circle cx="65" cy="51" r="3.2" fill="#1E293B" stroke="none" />
            <path
              d="M69 55 C69 55, 74 62, 69 65 C65 62, 69 55, 69 55 Z"
              fill="#38BDF8"
              stroke="#0284C7"
              strokeWidth="1.5"
            />
            <path d="M42 66 Q50 59 58 66" />
          </g>
        );

      case 'cemas':
        return (
          <g
            stroke="#1E293B"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M28 43 L39 39" />
            <path d="M72 43 L61 39" />
            <circle cx="35" cy="48" r="3" fill="#1E293B" stroke="none" />
            <circle cx="65" cy="48" r="3" fill="#1E293B" stroke="none" />
            <path d="M22 34 Q20 40 23 41 Q26 40 22 34 Z" fill="#7DD3FC" stroke="none" />
            <path d="M37 62 L43 58 L49 62 L55 58 L61 62" />
          </g>
        );

      case 'marah':
        return (
          <g
            stroke="#1E293B"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M28 40 L41 46" />
            <path d="M72 40 L59 46" />
            <circle cx="35" cy="50" r="3.2" fill="#1E293B" stroke="none" />
            <circle cx="65" cy="50" r="3.2" fill="#1E293B" stroke="none" />
            <path d="M40 65 Q50 57 60 65" />
          </g>
        );

      case 'lelah':
        return (
          <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
            <line x1="29" y1="54" x2="41" y2="54" />
            <line x1="59" y1="54" x2="71" y2="54" />
            <ellipse cx="50" cy="65" rx="4" ry="3" fill="#1E293B" stroke="none" />
            <text
              x="68"
              y="26"
              fill="#475569"
              stroke="none"
              fontSize="12"
              fontWeight="800"
              fontFamily="Plus Jakarta Sans, sans-serif"
            >
              zZ
            </text>
          </g>
        );

      default:
        return (
          <g stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="none">
            <circle cx="36" cy="47" r="3.2" fill="#1E293B" stroke="none" />
            <circle cx="64" cy="47" r="3.2" fill="#1E293B" stroke="none" />
            <path d="M41 59 Q50 63 59 59" />
          </g>
        );
    }
  };

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Ilustrasi mood ${moodName}`}
      className={animClasses}
    >
      <title>{`Mood ${moodName}`}</title>
      <ellipse cx="50" cy="92" rx="30" ry="4" fill="#1E293B" fillOpacity="0.08" />

      {preset ? (
        <path
          d={blobPath}
          fill={preset.fill}
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <path d={blobPath} fill="#FFFFFF" />
          <path
            d={blobPath}
            fill={strokeColor}
            fillOpacity="0.35"
            stroke={strokeColor}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </>
      )}

      <path
        d="M28 26 Q38 18 52 20"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {renderFace()}
    </svg>
  );
}

MoodBlob.propTypes = {
  moodName: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selected: PropTypes.bool,
  animated: PropTypes.bool,
  className: PropTypes.string
};
