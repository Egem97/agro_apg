import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const CompanyInfo = () => {
  const { user } = useAuth();

  if (!user?.company) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center space-x-4">
        {user.company.logo_url && (
          <img
            src={user.company.logo_url}
            alt={`${user.company.name} Logo`}
            className="w-16 h-16 rounded-lg object-contain border border-gray-200"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">
            {user.company.name}
          </h2>
          <p className="text-sm text-gray-600">
            {user.company.rubro_display} • {user.company.pais_display}
          </p>
          {user.company.descripcion && (
            <p className="text-sm text-gray-500 mt-1">
              {user.company.descripcion}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Usuario</div>
          <div className="font-medium text-gray-900">
            {user.full_name || user.email}
          </div>
          {user.cargo && (
            <div className="text-xs text-gray-500">{user.cargo}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfo;
