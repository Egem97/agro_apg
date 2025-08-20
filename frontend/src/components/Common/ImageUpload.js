import React, { useState, useRef, useEffect } from 'react';

const ImageUpload = ({ 
  onImageChange, 
  currentImage, 
  label = "Subir Imagen",
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
  className = ""
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Sincronizar preview con currentImage cuando cambie
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setError('');

    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Validar tamaño
    if (file.size > maxSize) {
      setError(`El archivo es demasiado grande. Máximo ${Math.round(maxSize / 1024 / 1024)}MB.`);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      if (onImageChange) {
        onImageChange(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onImageChange) {
      onImageChange(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {/* Preview de imagen actual */}
      {preview && (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            title="Eliminar imagen"
          >
            ×
          </button>
        </div>
      )}

      {/* Input de archivo */}
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
        />
      </div>

      {/* Información del archivo */}
      {fileInputRef.current?.files[0] && (
        <div className="text-sm text-gray-600">
          <p>Archivo: {fileInputRef.current.files[0].name}</p>
          <p>Tamaño: {formatFileSize(fileInputRef.current.files[0].size)}</p>
          <p>Tipo: {fileInputRef.current.files[0].type}</p>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Información de ayuda */}
      <div className="text-xs text-gray-500">
        <p>Formatos permitidos: JPEG, PNG, GIF</p>
        <p>Tamaño máximo: {Math.round(maxSize / 1024 / 1024)}MB</p>
      </div>
    </div>
  );
};

export default ImageUpload;
