import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';
import Login from './components/Auth/Login';

import Dashboard from './components/Dashboard/Dashboard';
import ShipmentList from './components/Shipments/ShipmentList';
import CompanyManagement from './components/Companies/CompanyManagement';
import CompanyProfile from './components/Companies/CompanyProfile';
import UserProfile from './components/User/UserProfile';
import ProductList from './components/Products/ProductList';
import ProductDetail from './components/Products/ProductDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Private Routes */}
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/embarques" element={
              <PrivateRoute>
                <Layout>
                  <ShipmentList />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/evaluacion_producto_terminado" element={
              <PrivateRoute>
                <Layout>
                  <ProductList />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/evaluacion_producto_terminad/:id" element={
              <PrivateRoute>
                <Layout>
                  <ProductDetail />
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/inspecciones" element={
              <PrivateRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Inspecciones</h2>
                    <p className="mt-2 text-gray-600">Módulo de inspecciones en desarrollo</p>
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/reportes-calidad" element={
              <PrivateRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Reportes de Calidad</h2>
                    <p className="mt-2 text-gray-600">Módulo de reportes en desarrollo</p>
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/muestras" element={
              <PrivateRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900">Muestras</h2>
                    <p className="mt-2 text-gray-600">Módulo de muestras en desarrollo</p>
                  </div>
                </Layout>
              </PrivateRoute>
            } />
            
            <Route path="/empresas" element={
              <PrivateRoute>
                <Layout>
                  <CompanyManagement />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/perfil-empresa" element={
              <PrivateRoute>
                <Layout>
                  <CompanyProfile />
                </Layout>
              </PrivateRoute>
            } />

            <Route path="/perfil-usuario" element={
              <PrivateRoute>
                <Layout>
                  <UserProfile />
                </Layout>
              </PrivateRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
