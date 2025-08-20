import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productionAPI } from '../../services/api';
import UserDebug from '../Debug/UserDebug';
import CompanyInfo from './CompanyInfo';
import {
  TruckIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CubeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await productionAPI.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError('Error cargando estadísticas del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Embarques',
      value: stats?.total_shipments || 0,
      icon: TruckIcon,
      color: 'bg-blue-500',
      href: '/embarques',
    },
    {
      title: 'Productos',
      value: stats?.total_products || 0,
      icon: CubeIcon,
      color: 'bg-green-500',
      href: '/productos',
    },
    {
      title: 'Inspecciones Totales',
      value: stats?.total_inspections || 0,
      icon: ClipboardDocumentListIcon,
      color: 'bg-purple-500',
      href: '/inspecciones',
    },
    {
      title: 'Inspecciones Pendientes',
      value: stats?.pending_inspections || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      href: '/inspecciones?status=pending',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Debug Component */}
      
      
      
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Resumen del sistema de seguimiento de evaluación de calidad
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.title}
            to={stat.href}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <dt>
              <div className={`absolute ${stat.color} rounded-md p-3`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.title}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Shipments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Embarques Recientes
              </h3>
              <Link
                to="/embarques"
                className="text-sm font-medium text-gray-700 hover:text-gray-600"
              >
                Ver todos
              </Link>
            </div>
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {stats?.recent_shipments?.slice(0, 5).map((shipment) => (
                  <li key={shipment.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <TruckIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {shipment.reference}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {shipment.product_name} - {shipment.shipper}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(shipment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-sm text-gray-500">
                        {shipment.inspections_count} inspecciones
                      </div>
                    </div>
                  </li>
                ))}
                {(!stats?.recent_shipments || stats.recent_shipments.length === 0) && (
                  <li className="py-4 text-center text-gray-500">
                    No hay embarques recientes
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
        {/* Company Info */}
        <CompanyInfo />       
        {/* Inspection Status Breakdown */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Estado de Inspecciones
            </h3>
            <div className="space-y-4">
              {stats?.inspection_status_breakdown?.map((item) => {
                let icon, color, label;
                switch (item.status) {
                  case 'pending':
                    icon = ClockIcon;
                    color = 'text-yellow-500';
                    label = 'Pendientes';
                    break;
                  case 'in_progress':
                    icon = ExclamationTriangleIcon;
                    color = 'text-blue-500';
                    label = 'En Progreso';
                    break;
                  case 'completed':
                    icon = CheckCircleIcon;
                    color = 'text-green-500';
                    label = 'Completadas';
                    break;
                  case 'rejected':
                    icon = ExclamationTriangleIcon;
                    color = 'text-red-500';
                    label = 'Rechazadas';
                    break;
                  default:
                    icon = DocumentTextIcon;
                    color = 'text-gray-500';
                    label = item.status;
                }
                const Icon = icon;

                return (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 ${color} mr-3`} />
                      <span className="text-sm font-medium text-gray-900">
                        {label}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{item.count}</span>
                  </div>
                );
              })}
              {(!stats?.inspection_status_breakdown || stats.inspection_status_breakdown.length === 0) && (
                <div className="text-center text-gray-500">
                  No hay datos de inspecciones
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      
      
    </div>
  );
};

export default Dashboard;
