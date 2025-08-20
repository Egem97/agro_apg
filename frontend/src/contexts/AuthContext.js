import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

// Función helper para sanitizar datos del usuario
export const sanitizeUserData = (userData) => {
  if (!userData) return null;
  
  return {
    id: userData.id,
    email: userData.email,
    username: userData.username,
    first_name: userData.first_name,
    last_name: userData.last_name,
    full_name: userData.full_name,
    phone: userData.phone,
         cargo: userData.cargo,
     departamento: userData.departamento,
     profile_image_url: userData.profile_image_url,
     is_client: userData.is_client,
    is_active: userData.is_active,
    is_staff: userData.is_staff,
    is_superuser: userData.is_superuser,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
    company: userData.company ? {
      id: userData.company.id,
      name: userData.company.name,
      domain: userData.company.domain,
      logo: userData.company.logo,
      logo_url: userData.company.logo_url,
      rubro: userData.company.rubro,
      rubro_display: userData.company.rubro_display,
      pais: userData.company.pais,
      pais_display: userData.company.pais_display,
      direccion: userData.company.direccion,
      telefono: userData.company.telefono,
      email_contacto: userData.company.email_contacto,
      website: userData.company.website,
      descripcion: userData.company.descripcion,
      activo: userData.company.activo,
      created_at: userData.company.created_at,
      updated_at: userData.company.updated_at,
      users_count: userData.company.users_count
    } : null,
    company_name: userData.company_name,
    role: userData.role ? {
      id: userData.role.id,
      name: userData.role.name,
      display_name: userData.role.display_name,
      description: userData.role.description,
      permissions: userData.role.permissions,
      is_active: userData.role.is_active,
      created_at: userData.role.created_at,
      updated_at: userData.role.updated_at,
    } : null,
    role_name: userData.role_name,
    is_admin: userData.is_admin,
    can_edit_company: userData.can_edit_company,
    can_manage_users: userData.can_manage_users
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario logueado al cargar la app
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user: userData, tokens } = response.data;
      
      const sanitizedUser = sanitizeUserData(userData);
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      
      setUser(sanitizedUser);
      return { success: true, user: sanitizedUser };
    } catch (error) {
      console.error('Error de login:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error de autenticación' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, tokens } = response.data;
      
      const sanitizedUser = sanitizeUserData(newUser);
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      
      setUser(sanitizedUser);
      return { success: true, user: sanitizedUser };
    } catch (error) {
      console.error('Error de registro:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error en el registro' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authAPI.updateProfile(profileData);
      const { user: updatedUser } = response.data;
      
      const sanitizedUser = sanitizeUserData(updatedUser);
      
      localStorage.setItem('user', JSON.stringify(sanitizedUser));
      setUser(sanitizedUser);
      
      return { success: true, user: sanitizedUser };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error actualizando perfil' 
      };
    }
  };

              const value = {
              user,
              login,
              register,
              logout,
              updateProfile,
              loading,
              isAuthenticated: !!user,
              // Métodos de verificación de roles
              isAdmin: () => user?.is_admin || user?.is_superuser || false,
              hasRole: (roleName) => user?.role?.name === roleName || false,
              canEditCompany: () => user?.can_edit_company || false,
              canManageUsers: () => user?.can_manage_users || false,
            };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
