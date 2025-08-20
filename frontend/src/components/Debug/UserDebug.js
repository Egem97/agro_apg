import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const UserDebug = () => {
  const { user } = useAuth();

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Debug - Datos del Usuario</h3>
      <pre className="text-xs bg-white p-2 rounded border overflow-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </div>
  );
};

export default UserDebug;
