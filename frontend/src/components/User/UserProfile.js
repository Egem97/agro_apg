import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import ImageUpload from '../Common/ImageUpload';
import {
  UserCircleIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    cargo: user?.cargo || '',
    departamento: user?.departamento || '',
  });
  const [profileImage, setProfileImage] = useState(null);

  // Actualizar formData cuando el usuario cambie
  useEffect(() => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      cargo: user?.cargo || '',
      departamento: user?.departamento || '',
    });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError('');
      setSuccess('');

      // Crear FormData para enviar imagen y datos
      const submitData = new FormData();
      
      // Agregar datos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });
      
      // Agregar imagen si existe
      if (profileImage) {
        submitData.append('profile_image_file', profileImage);
      }

      // Debug: mostrar contenido del FormData
      console.log('=== DEBUG: Contenido del FormData ===');
      for (let [key, value] of submitData.entries()) {
        console.log(`FormData - ${key}:`, value);
      }

      console.log('=== DEBUG: Datos a enviar ===');
      console.log('formData:', formData);
      console.log('hasProfileImage:', !!profileImage);
      console.log('profileImageName:', profileImage?.name);
      console.log('profileImageType:', profileImage?.type);
      console.log('profileImageSize:', profileImage?.size);

      console.log('=== DEBUG: Enviando petición ===');
      const response = await authAPI.updateProfile(submitData);
      console.log('=== DEBUG: Respuesta del servidor ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      
      await updateProfile(response.data.user);
      
      setSuccess('Perfil actualizado exitosamente');
      setShowForm(false);
      setProfileImage(null);
    } catch (err) {
      console.error('=== DEBUG: Error completo ===');
      console.error('Error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      let errorMessage = 'Error actualizando perfil';
      if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.response?.data?.non_field_errors) {
        errorMessage += `: ${err.response.data.non_field_errors.join(', ')}`;
      } else if (err.response?.data) {
        errorMessage += `: ${JSON.stringify(err.response.data)}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || '',
      cargo: user?.cargo || '',
      departamento: user?.departamento || '',
    });
    setProfileImage(null);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Perfil de Usuario
          </h1>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
        </div>

                 <form onSubmit={handleSubmit} className="space-y-6">
           <div className="bg-white p-6 rounded-lg shadow">
             <h3 className="text-lg font-medium text-gray-900 mb-4">Información Personal</h3>
             
             {/* Imagen de perfil */}
             <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Imagen de Perfil
               </label>
               <ImageUpload
                 onImageChange={setProfileImage}
                 currentImage={user?.profile_image_url}
                 label="Imagen de Perfil"
               />
             </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Apellido
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cargo
                </label>
                <input
                  type="text"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Departamento
                </label>
                <input
                  type="text"
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
          <p className="mt-1 text-sm text-gray-500">
            Información de tu cuenta
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <UserCircleIcon className="h-4 w-4 mr-2" />
          Editar Perfil
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* User Details */}
      <div className="bg-white shadow rounded-lg">
                 <div className="px-6 py-4 border-b border-gray-200">
           <div className="flex items-center space-x-4">
             {user?.profile_image_url ? (
               <img
                 src={user.profile_image_url}
                 alt="Foto de perfil"
                 className="h-16 w-16 rounded-full object-cover border border-gray-200"
               />
             ) : (
               <UserCircleIcon className="h-16 w-16 text-gray-400" />
             )}
             <div>
               <h2 className="text-xl font-semibold text-gray-900">
                 {user?.full_name || user?.email}
               </h2>
               <p className="text-sm text-gray-600">
                 {user?.email}
               </p>
             </div>
           </div>
         </div>

        <div className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Nombre</label>
              <p className="text-sm text-gray-900">{user?.first_name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Apellido</label>
              <p className="text-sm text-gray-900">{user?.last_name || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Teléfono</label>
              <p className="text-sm text-gray-900">{user?.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Cargo</label>
              <p className="text-sm text-gray-900">{user?.cargo || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Departamento</label>
              <p className="text-sm text-gray-900">{user?.departamento || 'No especificado'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Rol</label>
              <p className="text-sm text-gray-900">{user?.role_name || 'Sin rol asignado'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="text-sm font-medium text-gray-500">Estado</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                user?.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user?.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tipo de Usuario</label>
              <p className="text-sm text-gray-900">
                {user?.is_client ? 'Cliente' : 'Administrador'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Miembro desde</label>
              <p className="text-sm text-gray-900">
                {new Date(user?.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
