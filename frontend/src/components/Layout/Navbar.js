import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Navbar = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  const { user, logout } = useAuth();

  return (
         <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center gap-x-3 border-b border-gray-200 bg-white px-3 shadow-sm sm:gap-x-4 sm:px-4 lg:px-6">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Abrir sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
                     <button
             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
             className="hidden lg:flex p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors mr-4 border border-gray-200"
             title={sidebarCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
           >
             {sidebarCollapsed ? (
               <ChevronRightIcon className="h-5 w-5" />
             ) : (
               <ChevronLeftIcon className="h-5 w-5" />
             )}
           </button>
                     <h1 className="text-lg font-semibold text-gray-900">
             Sistema de Seguimiento
           </h1>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Ver notificaciones</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Profile dropdown */}
          <div className="relative">
            <div className="flex items-center gap-x-3">
                             {/* User Profile Image */}
               {user?.profile_image_url ? (
                 <img 
                   src={user.profile_image_url} 
                   alt="Foto de perfil"
                   className="h-6 w-6 rounded-full object-cover border border-gray-200"
                 />
               ) : user?.company?.logo_url ? (
                 <img 
                   src={user.company.logo_url} 
                   alt={`${user.company.name} Logo`}
                   className="h-6 w-6 rounded-full object-contain border border-gray-200"
                 />
               ) : (
                 <UserCircleIcon className="h-6 w-6 text-gray-400" />
               )}
               <div className="hidden lg:block">
                 <div className="text-xs font-medium text-gray-900">
                   {user?.full_name || user?.email}
                 </div>
                 <div className="text-xs text-gray-500">
                   {user?.company?.name || 'Usuario'}
                 </div>
               </div>
                                        <button
                            onClick={() => window.location.href = '/perfil-usuario'}
                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                            title="Mi Perfil"
                          >
                            <Cog6ToothIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={logout}
                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                            title="Cerrar sesión"
                          >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
