import React, { useState, useEffect } from 'react';
import ImageUpload from '../Common/ImageUpload';

const CompanyForm = ({ company, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    rubro: '',
    pais: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
    website: '',
    descripcion: '',
    activo: true
  });
  const [logoFile, setLogoFile] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        domain: company.domain || '',
        rubro: company.rubro || '',
        pais: company.pais || '',
        direccion: company.direccion || '',
        telefono: company.telefono || '',
        email_contacto: company.email_contacto || '',
        website: company.website || '',
        descripcion: company.descripcion || '',
        activo: company.activo !== undefined ? company.activo : true
      });
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la empresa es requerido';
    }

    if (!formData.domain.trim()) {
      newErrors.domain = 'El dominio es requerido';
    } else if (!/^[a-zA-Z0-9.-]+$/.test(formData.domain)) {
      newErrors.domain = 'El dominio solo puede contener letras, números, puntos y guiones';
    }

    if (!formData.rubro) {
      newErrors.rubro = 'El rubro es requerido';
    }

    if (!formData.pais) {
      newErrors.pais = 'El país es requerido';
    }

    if (formData.email_contacto && !/\S+@\S+\.\S+/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'El email de contacto debe ser válido';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'El sitio web debe comenzar con http:// o https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    
    // Agregar datos del formulario
    Object.keys(formData).forEach(key => {
      submitData.append(key, formData[key]);
    });

    // Agregar archivo de logo si existe
    if (logoFile) {
      submitData.append('logo_file', logoFile);
    }

    onSubmit(submitData);
  };

  const rubroOptions = [
    { value: '', label: 'Seleccionar rubro' },
    { value: 'agricultura', label: 'Agricultura' },
    { value: 'fruticultura', label: 'Fruticultura' },
    { value: 'horticultura', label: 'Horticultura' },
    { value: 'viticultura', label: 'Viticultura' },
    { value: 'ganaderia', label: 'Ganadería' },
    { value: 'avicultura', label: 'Avicultura' },
    { value: 'porcicultura', label: 'Porcicultura' },
    { value: 'acuicultura', label: 'Acuicultura' },
    { value: 'apicultura', label: 'Apicultura' },
    { value: 'otros', label: 'Otros' }
  ];

  const paisOptions = [
    { value: '', label: 'Seleccionar país' },
    { value: 'AR', label: 'Argentina' },
    { value: 'BR', label: 'Brasil' },
    { value: 'CL', label: 'Chile' },
    { value: 'CO', label: 'Colombia' },
    { value: 'EC', label: 'Ecuador' },
    { value: 'PE', label: 'Perú' },
    { value: 'UY', label: 'Uruguay' },
    { value: 'VE', label: 'Venezuela' },
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
    { value: 'CA', label: 'Canadá' },
    { value: 'ES', label: 'España' },
    { value: 'FR', label: 'Francia' },
    { value: 'DE', label: 'Alemania' },
    { value: 'IT', label: 'Italia' },
    { value: 'NL', label: 'Países Bajos' },
    { value: 'GB', label: 'Reino Unido' },
    { value: 'AU', label: 'Australia' },
    { value: 'NZ', label: 'Nueva Zelanda' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japón' },
    { value: 'KR', label: 'Corea del Sur' },
    { value: 'IN', label: 'India' },
    { value: 'ZA', label: 'Sudáfrica' },
    { value: 'OT', label: 'Otros' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.name ? 'border-red-300' : ''
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dominio *
            </label>
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.domain ? 'border-red-300' : ''
              }`}
            />
            {errors.domain && <p className="mt-1 text-sm text-red-600">{errors.domain}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rubro *
            </label>
            <select
              name="rubro"
              value={formData.rubro}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.rubro ? 'border-red-300' : ''
              }`}
            >
              {rubroOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.rubro && <p className="mt-1 text-sm text-red-600">{errors.rubro}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              País *
            </label>
            <select
              name="pais"
              value={formData.pais}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.pais ? 'border-red-300' : ''
              }`}
            >
              {paisOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.pais && <p className="mt-1 text-sm text-red-600">{errors.pais}</p>}
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de Contacto
            </label>
            <input
              type="email"
              name="email_contacto"
              value={formData.email_contacto}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.email_contacto ? 'border-red-300' : ''
              }`}
            />
            {errors.email_contacto && <p className="mt-1 text-sm text-red-600">{errors.email_contacto}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sitio Web
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                errors.website ? 'border-red-300' : ''
              }`}
            />
            {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Activo
            </label>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-gray-600 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                />
                <span className="ml-2 text-sm text-gray-700">Empresa activa</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <textarea
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo de la Empresa</h3>
        <ImageUpload
          onImageChange={setLogoFile}
          currentImage={company?.logo_url}
          label="Logo de la Empresa"
        />
      </div>

      {/* Descripción */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Descripción</h3>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          placeholder="Descripción de la empresa..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Guardando...' : (company ? 'Actualizar Empresa' : 'Crear Empresa')}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;
