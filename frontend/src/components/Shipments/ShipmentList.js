import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productionAPI } from '../../services/api';
import { 
  PlusIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  TruckIcon 
} from '@heroicons/react/24/outline';

const ShipmentList = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const response = await productionAPI.getShipments();
      setShipments(response.data.results || response.data);
    } catch (err) {
      setError('Error cargando embarques');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este embarque?')) {
      try {
        await productionAPI.deleteShipment(id);
        setShipments(shipments.filter(shipment => shipment.id !== id));
      } catch (err) {
        console.error('Error eliminando embarque:', err);
        alert('Error eliminando embarque');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Embarques</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los embarques de productos agrícolas
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            to="/embarques/nuevo"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Embarque
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {shipments.map((shipment) => (
            <li key={shipment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TruckIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-700">
                          {shipment.reference}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {shipment.transport_type_display}
                        </span>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">Producto:</span>
                            <span className="ml-1">{shipment.product_name}</span>
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span className="font-medium">Expedidor:</span>
                            <span className="ml-1">{shipment.shipper}</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium">Fecha:</span>
                          <span className="ml-1">
                            {new Date(shipment.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <span className="font-medium">Consignatario:</span>
                            <span className="ml-1">{shipment.consignee}</span>
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <span className="font-medium">Ubicación:</span>
                            <span className="ml-1">{shipment.location}</span>
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium">Inspecciones:</span>
                          <span className="ml-1">{shipment.inspections_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/embarques/${shipment.id}`}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      title="Ver detalles"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      to={`/embarques/${shipment.id}/editar`}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(shipment.id)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
          {shipments.length === 0 && !loading && (
            <li className="px-4 py-12 text-center">
              <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay embarques</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando un nuevo embarque.
              </p>
              <div className="mt-6">
                <Link
                  to="/embarques/nuevo"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Embarque
                </Link>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ShipmentList;
