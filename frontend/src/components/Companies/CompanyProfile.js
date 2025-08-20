import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CompanyForm from './CompanyForm';
import { authAPI } from '../../services/api';
import {
  BuildingOfficeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const CompanyProfile = () => {
  const { user, updateProfile } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (user?.company) {
      setCompany(user.company);
      setLoading(false);
    } else {
      setError('No tienes una empresa asignada');
      setLoading(false);
    }
  }, [user]);

  const handleUpdateCompany = async (formData) => {
    try {
      setFormLoading(true);
      await authAPI.updateCompany(company.id, formData);
      
      // Refresh user data to get updated company info
      const profileResponse = await authAPI.getProfile();
      const updatedUser = profileResponse.data;
      
      // Update context using the updateProfile method
      await updateProfile(updatedUser);
      
      setShowForm(false);
    } catch (err) {
      setError('Error actualizando empresa');
      console.error('Error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const canEditCompany = user?.can_edit_company;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!user?.company) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Sin empresa asignada
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                No tienes una empresa asignada en tu perfil.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Perfil de Empresa
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>
        <CompanyForm
          company={company}
          onSubmit={handleUpdateCompany}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil de Empresa</h1>
          <p className="mt-1 text-sm text-gray-500">
            Información de tu empresa
          </p>
        </div>
        {canEditCompany && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            Editar Empresa
          </button>
        )}
      </div>

      {/* Permission Notice */}
      {!canEditCompany && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-blue-700">
              Solo los administradores pueden editar la información de la empresa.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Company Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={`${company.name} Logo`}
                className="w-16 h-16 rounded-lg object-contain border border-gray-200"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {company.name}
              </h2>
              <p className="text-sm text-gray-600">
                {company.domain}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Rubro</label>
              <p className="text-sm text-gray-900">{company.rubro_display}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">País</label>
              <p className="text-sm text-gray-900">{company.pais_display}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email de Contacto</label>
              <p className="text-sm text-gray-900">{company.email_contacto || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-sm text-gray-900">{company.telefono || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Sitio Web</label>
              <p className="text-sm text-gray-900">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    {company.website}
                  </a>
                ) : 'No especificado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                company.activo 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {company.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

          {company.direccion && (
            <div>
              <label className="text-sm font-medium text-gray-500">Dirección</label>
              <p className="text-sm text-gray-900">{company.direccion}</p>
            </div>
          )}

          {company.descripcion && (
            <div>
              <label className="text-sm font-medium text-gray-500">Descripción</label>
              <p className="text-sm text-gray-900">{company.descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-500">Usuarios</label>
              <p className="text-2xl font-bold text-gray-900">{company.users_count}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Creada</label>
              <p className="text-sm text-gray-900">
                {new Date(company.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Actualizada</label>
              <p className="text-sm text-gray-900">
                {new Date(company.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
