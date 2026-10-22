// Komponen unggah gambar drag-and-drop & klik dengan pratinjau dan validasi klien
import React, { useState, useEffect, useId } from 'react';
import { UploadCloud, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { validateImageFile } from '../utils/validators';
import { getImageUrl } from '../utils/imageUrl';

export default function ImageUpload({
  label = 'Foto Momen Hari Ini (Opsional)',
  existingImagePath = null,
  onFileSelect,
  errorText
}) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const processSelectedFile = (file) => {
    if (!file) {
      setLocalError(null);
      setPreviewUrl(null);
      onFileSelect(null);
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setLocalError(validation.error);
      setPreviewUrl(null);
      onFileSelect(null);
      return;
    }

    setLocalError(null);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    onFileSelect(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleClearNewSelection = () => {
    setLocalError(null);
    setPreviewUrl(null);
    onFileSelect(null);
  };

  const displayImage = previewUrl || (existingImagePath ? getImageUrl(existingImagePath) : null);
  const combinedError = localError || errorText;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-extrabold text-ink mb-1.5">
        {label}
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-5 transition-all ${
          isDragging
            ? 'border-denim bg-frost scale-[1.01]'
            : 'border-frost-border hover:border-denim bg-frost/30'
        }`}
      >
        {displayImage ? (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img
              src={displayImage}
              alt="Pratinjau foto unggahan"
              className="w-28 h-28 object-cover rounded-2xl border border-frost-border shadow-xs shrink-0"
            />
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <p className="text-xs font-medium text-ink-soft">
                {previewUrl
                  ? 'Foto baru telah dipilih dan siap disimpan bersama formulir.'
                  : 'Foto saat ini tersimpan di server. Pilih foto baru jika ingin menggantinya.'}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label
                  htmlFor={inputId}
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-denim hover:bg-denim-dark text-white text-xs font-bold transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ganti Foto</span>
                </label>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleClearNewSelection}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-frost-border hover:bg-frost text-ink text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Batalkan Foto Baru</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="cursor-pointer flex flex-col items-center justify-center py-5 text-center"
          >
            <span className="w-12 h-12 rounded-2xl bg-white border border-frost-border text-denim flex items-center justify-center mb-2 shadow-2xs">
              <UploadCloud className="w-6 h-6" />
            </span>
            <span className="text-sm font-bold text-denim-dark hover:underline">
              Tarik & lepaskan foto ke sini, atau klik untuk memilih
            </span>
            <span className="text-xs text-ink-soft mt-1">
              Mendukung JPG, PNG, atau WEBP (Maksimal 2 MB)
            </span>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
      </div>

      {combinedError && (
        <p role="alert" className="text-xs text-rose-600 font-bold mt-1.5">
          {combinedError}
        </p>
      )}
    </div>
  );
}
