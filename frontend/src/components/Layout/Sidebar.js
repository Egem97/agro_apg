import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  BeakerIcon,
  DocumentTextIcon,
  CubeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon, // Added for company profile
  UserIcon, // Added for user profile
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Producto Terminado', href: '/evaluacion_producto_terminado', icon: CubeIcon },
  { name: 'Perfil Empresa', href: '/perfil-empresa', icon: BuildingOffice2Icon },
  { name: 'Mi Perfil', href: '/perfil-usuario', icon: UserIcon },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed }) => {
  return (
    <>
      {/* Mobile sidebar */}
      <div className={`relative z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" />
        <div className="fixed inset-0 flex">
          <div className="relative mr-16 flex w-full max-w-xs flex-1">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button
                type="button"
                className="-m-2.5 p-2.5"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Cerrar sidebar</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
            <div className={`flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 pb-4 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
                          <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center">
                <img 
                  src="/logo.png" 
                  alt="APG Logo" 
                  className="w-8 h-8 mr-3 object-contain"
                />
                <div className="text-white text-xl font-bold">APG</div>
              </div>
            </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <NavLink
                            to={item.href}
                            className={({ isActive }) =>
                              `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                isActive
                                  ? 'bg-gray-700 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`
                            }
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon
                              className="h-6 w-6 shrink-0"
                              aria-hidden="true"
                            />
                            {item.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 pb-4 ${sidebarCollapsed ? 'px-2' : 'px-6'}`}>
                     <div className={`flex h-16 shrink-0 items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
             <div className="flex items-center">
               <img 
                 src="/logo.png" 
                 alt="APG PACKING Logo" 
                 className={`object-contain ${sidebarCollapsed ? 'w-8 h-8' : 'w-8 h-8 mr-3'}`}
               />
               {!sidebarCollapsed && (
                 <div className="text-white text-xl font-bold">APG PACKING</div>
               )}
             </div>
           </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                                         {navigation.map((item) => (
                         <li key={item.name}>
                           <NavLink
                             to={item.href}
                             className={({ isActive }) =>
                               `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold ${
                                 isActive
                                   ? 'bg-gray-700 text-white'
                                   : 'text-gray-300 hover:text-white hover:bg-gray-700'
                               } ${sidebarCollapsed ? 'justify-center' : ''}`
                             }
                             title={sidebarCollapsed ? item.name : ''}
                           >
                             <item.icon
                               className="h-6 w-6 shrink-0"
                               aria-hidden="true"
                             />
                             {!sidebarCollapsed && item.name}
                           </NavLink>
                         </li>
                       ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
