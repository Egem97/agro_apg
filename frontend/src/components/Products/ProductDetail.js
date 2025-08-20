import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
    ArrowLeftIcon, 
    CalendarIcon, 
    CheckCircleIcon, 
    XCircleIcon,
    DocumentArrowDownIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    TagIcon,
    UserIcon,
    MapPinIcon,
    CogIcon,
    ClockIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import { productionAPI } from '../../services/api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ProductDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [qualityData, setQualityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);
    const pdfRef = useRef();

    useEffect(() => {
        fetchQualityData();
    }, [id]);

    const fetchQualityData = async () => {
        try {
            setLoading(true);
            const response = await productionAPI.getQualityDataById(id);
            setQualityData(response.data);
        } catch (err) {
            setError('Error al cargar los datos de calidad');
            console.error('Error fetching quality data:', err);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = async () => {
        setExporting(true);
        try {
            const element = pdfRef.current;
            
            // Mostrar temporalmente el elemento para que html2canvas pueda capturarlo
            element.style.display = 'block';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '0';
            element.style.zIndex = '-1';
            
            // Esperar un momento para que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: element.scrollWidth,
                height: element.scrollHeight,
                scrollX: 0,
                scrollY: 0
            });
            
            // Ocultar el elemento nuevamente
            element.style.display = 'none';
            element.style.position = 'static';
            element.style.left = 'auto';
            element.style.top = 'auto';
            element.style.zIndex = 'auto';
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
    
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
    
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
    
            const contenedor = getContenedor(qualityData);
            pdf.save(`quality_report_${contenedor.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
        } catch (err) {
            console.error('Error generating PDF:', err);
            // Asegurar que el elemento se oculte en caso de error
            if (pdfRef.current) {
                pdfRef.current.style.display = 'none';
                pdfRef.current.style.position = 'static';
                pdfRef.current.style.left = 'auto';
                pdfRef.current.style.top = 'auto';
                pdfRef.current.style.zIndex = 'auto';
            }
        } finally {
            setExporting(false);
        }
    };
    

    const getContenedor = (item) => {
        // Intentar obtener el contenedor desde el campo contenedor (que viene del serializer)
        if (item.contenedor) {
            return item.contenedor;
        }
        
        // Fallback: intentar obtener desde processed_data si existe
        if (item.processed_data && item.processed_data.additional_info) {
            return item.processed_data.additional_info.n_fcl || 'N/A';
        }
        
        return 'N/A';
    };

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
            month: 'long',
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !qualityData) {
        return (
            <div className="text-center py-8">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
                <p className="mt-1 text-sm text-gray-500">{error || 'No se encontraron datos'}</p>
                <Link
                    to="/productos"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    Volver a la lista
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/productos"
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {getContenedor(qualityData)}
                            </h1>
                            <p className="text-gray-600">{formatValue(qualityData.empresa)}</p>
                        </div>
                    </div>
                    <button
                        onClick={generatePDF}
                        disabled={exporting}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        {exporting ? 'Generando PDF...' : 'Exportar PDF'}
                    </button>
                </div>
            </div>

            {/* PDF Content - Hidden for PDF generation */}
            <div 
                ref={pdfRef} 
                className="bg-white p-8" 
                style={{ 
                    display: 'none',
                    width: '800px',
                    minHeight: 'auto',
                    position: 'absolute',
                    left: '-9999px',
                    top: '0',
                    zIndex: -1
                }}
            >
                {/* PDF Header */}
                <div className="relative mb-8">
                    {/* User Image in Top Left Corner */}
                    <div className="absolute top-0 left-0">
                        {user?.profile_image_url ? (
                            <img 
                                src={user.profile_image_url} 
                                alt="User Profile" 
                                className="w-16 h-16 object-cover border-2 "
                            />
                        ) : (
                            <div className="w-30 h-25 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                <UserIcon className="h-8 w-8 text-gray-500" />
                            </div>
                        )}
                    </div>
                    
                    {/* Main Header Content */}
                    <div className="text-center pt-2">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">QUALITY CONTROL REPORT</h1>
                        <div className="flex justify-between items-start">
                            <div className="text-left">
                                <p className="text-sm text-gray-600"><strong>Shipper:</strong> {formatValue(qualityData.empresa)}</p>
                                <p className="text-sm text-gray-600"><strong>Reference:</strong> {getContenedor(qualityData)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600"><strong>Date:</strong> {formatDate(qualityData.fecha_registro)}</p>
                                <p className="text-sm text-gray-600"><strong>Sample #:</strong> {qualityData.id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Information */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Product Information</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p><strong>Product:</strong> Blueberry</p>
                            <p><strong>Variety:</strong> {formatValue(qualityData.variedad)}</p>
                            <p><strong>Producer:</strong> {formatValue(qualityData.productor)}</p>
                            <p><strong>Farm:</strong> {formatValue(qualityData.fundo)}</p>
                        </div>
                        <div>
                            <p><strong>Product Type:</strong> {formatValue(qualityData.tipo_producto)}</p>
                            <p><strong>Presentation:</strong> {formatValue(qualityData.presentacion)}</p>
                            <p><strong>Container:</strong> {getContenedor(qualityData)}</p>
                        </div>
                    </div>
                </div>



                {/* Quality Metrics */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Quality Metrics</h2>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-bold text-lg text-green-600">{formatValue(qualityData.total_exportable)}%</p>
                            <p className="text-gray-600">Exportable</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-bold text-lg text-red-600">{formatValue(qualityData.defectos_porcentaje)}%</p>
                            <p className="text-gray-600">Defects</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded">
                            <p className="font-bold text-lg text-blue-600">{formatValue(qualityData.solidos_solubles)}</p>
                            <p className="text-gray-600">BRIX</p>
                        </div>
                    </div>
                </div>

                {/* Quality Assessment */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Quality Assessment</h2>
                    <div className="grid grid-cols-2 gap-8 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2"><strong>General Quality:</strong></p>
                                <span className={`inline-block px-3 py-2 rounded text-sm font-medium ${getQualityColor(qualityData.calidad_general)}`}>
                                    {qualityData.calidad_display}
                                </span>
                            </div>
                            <div>
                                <p className="mb-2"><strong>Approval Status:</strong></p>
                                <span className={`inline-block px-3 py-2 rounded text-sm font-medium ${qualityData.aprobado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {qualityData.aprobado_display}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-2"><strong>Registration Date:</strong></p>
                                <p className="text-gray-700">{formatDate(qualityData.fecha_registro)}</p>
                            </div>
                            <div>
                                <p className="mb-2"><strong>Raw Material Date:</strong></p>
                                <p className="text-gray-700">{formatValue(qualityData.fecha_mp)}</p>
                            </div>
                            <div>
                                <p className="mb-2"><strong>Process Date:</strong></p>
                                <p className="text-gray-700">{formatValue(qualityData.fecha_proceso)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                {qualityData.defectos_descripcion && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b-2 border-gray-300 pb-2">Defects Description</h2>
                        <p className="text-sm text-gray-700">{qualityData.defectos_descripcion}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 pt-4 border-t-2 border-gray-300">
                    <div className="text-center text-sm text-gray-600">
                        <p>Generated by APG Packing Quality System</p>
                        <p>Report ID: {qualityData.id} | Date: {formatDate(qualityData.fecha_registro)}</p>
                    </div>
                </div>
            </div>

            {/* Regular Content - Visible on screen */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Information */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Empresa</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.empresa)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Registro</label>
                                <div className="flex items-center text-sm text-gray-900">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    {formatDate(qualityData.fecha_registro)}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Estado</label>
                                <div className="flex items-center">
                                    {qualityData.aprobado ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                    ) : (
                                        <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                                    )}
                                    <span className="text-sm font-medium">
                                        {qualityData.aprobado_display}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Calidad General</label>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQualityColor(qualityData.calidad_general)}`}>
                                    {qualityData.calidad_display}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quality Metrics */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Calidad</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Sólidos Solubles (BRIX)</label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatValue(qualityData.solidos_solubles)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Acidez Titulable</label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatValue(qualityData.acidez_titulable)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Calibre</label>
                                <p className="text-lg font-semibold text-gray-900">
                                    {formatValue(qualityData.calibre)}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Defectos (%)</label>
                                <p className={`text-lg font-semibold ${getDefectColor(qualityData.defectos_porcentaje)}`}>
                                    {formatValue(qualityData.defectos_porcentaje)}%
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total Exportable</label>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatValue(qualityData.total_exportable)}%
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Total No Exportable</label>
                                <p className="text-lg font-semibold text-red-600">
                                    {formatValue(qualityData.total_no_exportable)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Variedad</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.variedad)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Productor</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.productor)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fundo</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.fundo)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tipo de Producto</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.tipo_producto)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Presentación</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.presentacion)}</p>
                            </div>
                        </div>
                    </div>



                    {/* Defects Description */}
                    {qualityData.defectos_descripcion && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción de Defectos</h2>
                            <p className="text-sm text-gray-700">{qualityData.defectos_descripcion}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Container Info */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Contenedor</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Código</label>
                                <p className="text-sm font-bold text-gray-900">{getContenedor(qualityData)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de MP</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.fecha_mp)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Proceso</label>
                                <p className="text-sm text-gray-900">{formatValue(qualityData.fecha_proceso)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quality Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Calidad</h2>
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <p className="text-2xl font-bold text-green-600">{formatValue(qualityData.total_exportable)}%</p>
                                <p className="text-sm text-green-700">Exportable</p>
                            </div>
                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                <p className="text-2xl font-bold text-red-600">{formatValue(qualityData.defectos_porcentaje)}%</p>
                                <p className="text-sm text-red-700">Defectos</p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <p className="text-2xl font-bold text-blue-600">{formatValue(qualityData.solidos_solubles)}</p>
                                <p className="text-sm text-blue-700">BRIX</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;