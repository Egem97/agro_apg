import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import CompanyForm from './CompanyForm';
import { authAPI } from '../../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const CompanyManagement = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCompanies();
      console.log('API Response:', response); // Debug log
      console.log('Response data:', response.data); // Debug log
      
      // Ensure companies is always an array
      const companiesData = Array.isArray(response?.data) ? response.data : [];
      console.log('Companies data:', companiesData); // Debug log
      setCompanies(companiesData);
    } catch (err) {
      setError('Error cargando empresas');
      console.error('Error:', err);
      setCompanies([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (formData) => {
    try {
      setFormLoading(true);
      await authAPI.createCompany(formData);
      await fetchCompanies();
      setShowForm(false);
      setEditingCompany(null);
    } catch (err) {
      setError('Error creando empresa');
      console.error('Error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateCompany = async (formData) => {
    try {
      setFormLoading(true);
      await authAPI.updateCompany(editingCompany.id, formData);
      await fetchCompanies();
      setShowForm(false);
      setEditingCompany(null);
    } catch (err) {
      setError('Error actualizando empresa');
      console.error('Error:', err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta empresa?')) {
      return;
    }

    try {
      await authAPI.deleteCompany(companyId);
      await fetchCompanies();
    } catch (err) {
      setError('Error eliminando empresa');
      console.error('Error:', err);
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setShowForm(true);
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setShowDetails(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCompany(null);
    setShowDetails(false);
    setSelectedCompany(null);
  };

  const canEditCompany = user?.can_edit_company;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>
        <CompanyForm
          company={editingCompany}
          onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
          onCancel={handleCancel}
          loading={formLoading}
        />
      </div>
    );
  }

  if (showDetails && selectedCompany) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Detalles de la Empresa
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {selectedCompany.logo_url && (
                <img
                  src={selectedCompany.logo_url}
                  alt={`${selectedCompany.name} Logo`}
                  className="w-16 h-16 rounded-lg object-contain border border-gray-200"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedCompany.name}
                </h2>
                <p className="text-sm text-gray-600">
                  {selectedCompany.domain}
                </p>
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Rubro</label>
                <p className="text-sm text-gray-900">{selectedCompany.rubro_display}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">País</label>
                <p className="text-sm text-gray-900">{selectedCompany.pais_display}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email de Contacto</label>
                <p className="text-sm text-gray-900">{selectedCompany.email_contacto || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-sm text-gray-900">{selectedCompany.telefono || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Sitio Web</label>
                <p className="text-sm text-gray-900">
                  {selectedCompany.website ? (
                    <a href={selectedCompany.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      {selectedCompany.website}
                    </a>
                  ) : 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedCompany.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedCompany.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
            
            {selectedCompany.direccion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                <p className="text-sm text-gray-900">{selectedCompany.direccion}</p>
              </div>
            )}
            
            {selectedCompany.descripcion && (
              <div>
                <label className="text-sm font-medium text-gray-500">Descripción</label>
                <p className="text-sm text-gray-900">{selectedCompany.descripcion}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-500">Usuarios</label>
                <p className="text-2xl font-bold text-gray-900">{selectedCompany.users_count}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Creada</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCompany.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Actualizada</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedCompany.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las empresas del sistema
          </p>
        </div>
        {canEditCompany && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nueva Empresa
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Companies List */}
      <div className="bg-white shadow rounded-lg">
                 <div className="px-6 py-4 border-b border-gray-200">
           <h2 className="text-lg font-medium text-gray-900">Empresas ({Array.isArray(companies) ? companies.length : 0})</h2>
         </div>
        
                 {!Array.isArray(companies) || companies.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empresas</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canEditCompany 
                ? 'Comienza creando una nueva empresa.' 
                : 'No hay empresas disponibles.'
              }
            </p>
            {canEditCompany && (
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nueva Empresa
                </button>
              </div>
            )}
          </div>
                 ) : (
           <div className="divide-y divide-gray-200">
             {Array.isArray(companies) && companies.map((company) => (
              <div key={company.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {company.logo_url && (
                      <img
                        src={company.logo_url}
                        alt={`${company.name} Logo`}
                        className="w-12 h-12 rounded-lg object-contain border border-gray-200"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {company.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {company.domain} • {company.rubro_display} • {company.pais_display}
                      </p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          company.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {company.activo ? 'Activa' : 'Inactiva'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {company.users_count} usuarios
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewDetails(company)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    
                    {canEditCompany && (
                      <>
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Editar empresa"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Eliminar empresa"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;
