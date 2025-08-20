import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
    CalendarIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    ExclamationTriangleIcon,
    ArrowRightIcon,
    ChartBarIcon,
    GlobeAltIcon,
    TagIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { productionAPI } from '../../services/api';

const ProductList = () => {
    const [qualityData, setQualityData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    const fetchQualityData = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, page_size: 10 }; // Limitar a 10 registros por página
            if (debouncedSearchTerm) {
                params.contenedor = debouncedSearchTerm;
            }
            const response = await productionAPI.getQualityData(params);
            console.log(response.data.results);
            setQualityData(response.data.results || []);
            setTotalPages(Math.ceil((response.data.count || 0) / 10)); // Cambiar a 10 registros por página
        } catch (err) {
            setError('Error al cargar los datos de calidad');
            console.error('Error fetching quality data:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm]);

    const fetchStats = async () => {
        try {
            const response = await productionAPI.getQualityDataStats();
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Debounce para la búsqueda
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500); // 500ms de delay

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchQualityData();
        fetchStats();
    }, [fetchQualityData]);

    const getQualityColor = (quality) => {
        switch (quality) {
            case 'excelente': return 'bg-green-100 text-green-800';
            case 'buena': return 'bg-blue-100 text-blue-800';
            case 'regular': return 'bg-yellow-100 text-yellow-800';
            case 'mala': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatValue = (value) => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        
        // Si es un número, formatear con máximo 2 decimales
        if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            return parseFloat(value).toFixed(2);
        }
        
        return value;
    };

    const getDefectColor = (percentage) => {
        if (!percentage) return 'text-gray-500';
        if (percentage <= 2) return 'text-green-600';
        if (percentage <= 5) return 'text-blue-600';
        if (percentage <= 10) return 'text-yellow-600';
        return 'text-red-600';
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Resetear a la primera página
    };

    const getContenedor = (item) => {
        return item.contenedor || 'N/A';
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Header */}
            <div className="">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evaluación de Producto Terminado</h1>
                        <p className="text-gray-600">Datos de calidad de arándanos por contenedor</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Filtro por contenedor con debounce */}
                        <div className="flex items-center space-x-2">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Buscar por contenedor..."
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {searchTerm !== debouncedSearchTerm && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            )}
                        </div>
                        {stats && (
                            <div className="text-right">
                                <p className="text-sm text-gray-500">
                                    {debouncedSearchTerm ? 'Resultados encontrados' : 'Total registros'}
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {debouncedSearchTerm ? qualityData.length : stats.total_registros}
                                </p>
                                {debouncedSearchTerm && (
                                    <p className="text-xs text-gray-400">
                                        de {stats.total_registros} total
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cards Grid - Individual Cards */}
            {qualityData.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {qualityData.map((item) => (
                        <Link
                            key={item.id}
                            to={`/evaluacion_producto_terminad/${item.id}`}
                            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100"
                        >
                            <div className="p-6">
                                <div className="flex items-center space-x-6">
                                    {/* Container Info */}
                                    <div className="flex-shrink-0 w-56">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-lg font-bold text-gray-900 truncate">
                                                    {getContenedor(item)}
                                                </h5>
                                                {item.aprobado ? (
                                                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                                                ) : (
                                                    <XCircleIcon className="h-6 w-6 text-red-500" />
                                                )}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600 mb-3">
                                                <CalendarIcon className="h-4 w-4 mr-2" />
                                                {formatDate(item.fecha_registro)}
                                            </div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(item.calidad_general)}`}>
                                                {item.calidad_display}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Main Information */}
                                    <div className="flex-1">
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                            <h4 className="text-sm font-semibold text-blue-800 mb-3">Información del Producto</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    {item.variedad && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <TagIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>Variedad:</strong> {item.variedad}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.evaluador && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <ChartBarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>Evaluador:</strong> {item.evaluador}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.fecha_mp && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>FECHA DE MP:</strong> {formatDate(item.fecha_mp)}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.fecha_proceso && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <CalendarIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>FECHA DE PROCESO:</strong> {formatDate(item.fecha_proceso)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    {item.productor && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <GlobeAltIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>PRODUCTOR:</strong> {item.productor}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.tipo_producto && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <TagIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>TIPO DE PRODUCTO:</strong> {item.tipo_producto}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.fundo && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <GlobeAltIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>FUNDO:</strong> {item.fundo}</span>
                                                        </div>
                                                    )}
                                                    
                                                    {item.presentacion && (
                                                        <div className="flex items-center text-sm text-gray-700">
                                                            <TagIcon className="h-4 w-4 mr-2 flex-shrink-0 text-blue-600" />
                                                            <span className="truncate"><strong>PRESENTACION:</strong> {item.presentacion}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="flex-shrink-0 w-40">
                                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                            <h4 className="text-sm font-semibold text-green-800 mb-3">Métricas de Calidad</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">Exportable:</span>
                                                    <span className="text-sm font-bold text-green-600">
                                                        {formatValue(item.total_exportable)}%
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">Defectos:</span>
                                                    <span className={`text-sm font-bold ${getDefectColor(item.defectos_porcentaje)}`}>
                                                        {formatValue(item.defectos_porcentaje)}%
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-700">BRIX:</span>
                                                    <span className="text-sm font-bold text-gray-900">
                                                        {formatValue(item.solidos_solubles)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ID and Arrow */}
                                    <div className="flex-shrink-0">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
                                            <div className="text-xs text-gray-500 mb-2">
                                                ID: {item.id}
                                            </div>
                                            <ArrowRightIcon className="h-6 w-6 text-blue-500 mx-auto" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        No se encontraron registros de calidad para mostrar.
                    </p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <nav className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-2 text-sm font-medium rounded-md ${
                                    currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default ProductList;
