import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  EnvelopeIcon, 
  LockClosedIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Background Image Section */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/blueberry_login.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/85 via-gray-800/80 to-gray-900/85"></div>
        </div>
        
        {/* Overlay Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
                         {/* Logo Section */}
             <div className="flex items-center mb-8">
               <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mr-4 border border-white/20">
                                   <img 
                    src="/logo.png" 
                    alt="APG PACKING Logo" 
                    className="w-12 h-12 object-contain"
                  />
               </div>
               <div>
                 <h1 className="text-3xl font-bold text-white">APG PACKING</h1>
                 <p className="text-gray-300">Sistema de Seguimiento</p>
               </div>
             </div>
            
            <h2 className="text-4xl font-bold mb-4 text-white">
              Control de tu Materia Prima
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Monitorea el procesamiento de arándanos desde la cosecha hasta el empaque final. 
              Optimiza tu producción con datos precisos y reportes detallados.
            </p>
            
            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 border border-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-gray-300">Seguimiento de procesos</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 border border-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-gray-300">Control de calidad</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-700/50 rounded-full flex items-center justify-center mr-3 border border-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
                <span className="text-gray-300">Reportes automatizados</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Subtle floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gray-400/10 rounded-full blur-lg"></div>
      </div>

             {/* Login Form Section */}
               <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-lg w-full space-y-10">
                                    {/* Logo Principal - Centrado encima del formulario */}
              <div className="text-center">
                <div className="flex flex-col items-center justify-center mb-10">
                                     <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center mb-6 border-2 border-gray-200 shadow-xl">
                     <img 
                       src="/logo.png" 
                       alt="APG PACKING Logo" 
                       className="w-28 h-28 object-contain"
                     />
                   </div>
                </div>
              </div>

                                                                                       <div className="text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-3">
                 BIENVENIDO
               </h2>
               <p className="text-lg text-gray-600">
                 Accede a tu panel de control de producción
               </p>
             </div>

           <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                {error}
              </div>
            )}

                         <div className="space-y-6">
               <div>
                 <label htmlFor="email" className="block text-base font-semibold text-gray-700 mb-3">
                   Usuario
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <EnvelopeIcon className="h-6 w-6 text-gray-400" />
                   </div>
                                      <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-colors text-base"
                      placeholder="username"
                      value={formData.email}
                      onChange={handleChange}
                    />
                 </div>
               </div>

               <div>
                 <label htmlFor="password" className="block text-base font-semibold text-gray-700 mb-3">
                   Contraseña
                 </label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <LockClosedIcon className="h-6 w-6 text-gray-400" />
                   </div>
                                      <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="block w-full pl-12 pr-12 py-4 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition-colors text-base"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                   <button
                     type="button"
                     className="absolute inset-y-0 right-0 pr-4 flex items-center"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <EyeSlashIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                     ) : (
                       <EyeIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                     )}
                   </button>
                 </div>
               </div>
             </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                 {loading ? (
                   <div className="flex items-center">
                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                     Iniciando sesión...
                   </div>
                 ) : (
                   'Iniciar Sesión'
                 )}
               </button>
             </div>

            
          </form>

                                           {/* Footer */}
            <div className="text-center pt-10 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                © 2025 APG PACKING. Sistema de seguimiento de producción agrícola.
              </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
