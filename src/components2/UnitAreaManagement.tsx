

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Building2, MapPin, Plus, Pencil, Trash2, X, Save, Menu, FilePlus, Users, LogOut, ClipboardList, Settings, ChevronLeft, ChevronRight } from 'lucide-react'; import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';
import type { Unit, Area } from '../types/inspection';

export default function UnitAreaManagement() {
    const navigate = useHistory();
    const { t, isRTL } = useTranslation();
    const {
        units,
        areas,
        addUnit,
        updateUnit,
        deleteUnit,
        addArea,
        updateArea,
        deleteArea,
        isLoading,
        error,
        currentUser,
        initializeApp,
        isAdmin,
        isMaster
    } = useInspectionStore();
    const { signOut } = useInspectionStore();

    const [activeTab, setActiveTab] = useState<'units' | 'areas'>('units');
    const [showAddUnitDialog, setShowAddUnitDialog] = useState(false);
    const [showAddAreaDialog, setShowAddAreaDialog] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [editingArea, setEditingArea] = useState<Area | null>(null);
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);
    const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
    const [addUnitDialogError, setAddUnitDialogError] = useState<string | null>(null);
    const [addAreaDialogError, setAddAreaDialogError] = useState<string | null>(null);
    const [newUnit, setNewUnit] = useState<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>>({
        name: '',
        code: '',
        description: ''
    });
    const [newArea, setNewArea] = useState<Omit<Area, 'id' | 'createdAt' | 'updatedAt'>>({
        unitId: '',
        name: '',
        code: '',
        description: ''
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

   // Redirect non-admin users
    useEffect(() => {
        if (currentUser && !isMaster()) {
            navigate.push('/management');
        }
    }, [currentUser, isMaster, navigate]);

    // Don't render if not admin
    if (currentUser && !isMaster()) {
        return null;
    }

    const handleAddUnit = async () => {
        setAddUnitDialogError(null);
        try {
            await addUnit(newUnit);
            setShowAddUnitDialog(false);
            setNewUnit({ name: '', code: '', description: '' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add unit';
            setAddUnitDialogError(errorMessage);
        }
    };

    const handleUpdateUnit = async () => {
        if (!editingUnit) return;
        try {
            await updateUnit(editingUnit);
            setEditingUnit(null);
        } catch (err) {
            console.error('Error updating unit:', err);
        }
    };

    const handleDeleteUnit = async () => {
        if (!unitToDelete) return;
        try {
            await deleteUnit(unitToDelete);
            setUnitToDelete(null);
        } catch (err) {
            console.error('Error deleting unit:', err);
        }
    };

    const handleAddArea = async () => {
        setAddAreaDialogError(null);

        // Client-side validation
        if (!newArea.unitId) {
            setAddAreaDialogError('Please select a unit');
            return;
        }

        if (!newArea.code.trim()) {
            setAddAreaDialogError('Area code is required');
            return;
        }

        if (!newArea.name.trim()) {
            setAddAreaDialogError('Area name is required');
            return;
        }

        try {
            await addArea(newArea);
            setShowAddAreaDialog(false);
            setNewArea({ unitId: '', name: '', code: '', description: '' });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to add area';
            setAddAreaDialogError(errorMessage);
        }
    };

    const handleUpdateArea = async () => {
        if (!editingArea) return;
        try {
            await updateArea(editingArea);
            setEditingArea(null);
        } catch (err) {
            console.error('Error updating area:', err);
        }
    };

    const handleDeleteArea = async () => {
        if (!areaToDelete) return;
        try {
            await deleteArea(areaToDelete);
            setAreaToDelete(null);
        } catch (err) {
            console.error('Error deleting area:', err);
        }
    };

    const getUnitName = (unitId: string) => {
        return units.find(u => u.id === unitId)?.name || '';
    };

    // Pagination calculations for units
    const totalUnits = units.length;
    const totalUnitPages = Math.ceil(totalUnits / itemsPerPage);
    const unitStartIndex = (currentPage - 1) * itemsPerPage;
    const unitEndIndex = unitStartIndex + itemsPerPage;
    const filteredUnits = units.filter(unit => {
        if (searchTerm === '') return true;
        const searchLower = searchTerm.toLowerCase();
        return unit.name.toLowerCase().includes(searchLower) ||
            unit.code.toLowerCase().includes(searchLower) ||
            unit.description.toLowerCase().includes(searchLower);
    });
    const paginatedUnits = filteredUnits.slice(unitStartIndex, unitEndIndex);

    // Pagination calculations for areas
    const filteredAreas = areas.filter(area => {
        if (searchTerm === '') return true;
        const searchLower = searchTerm.toLowerCase();
        return area.name.toLowerCase().includes(searchLower) ||
            area.code.toLowerCase().includes(searchLower) ||
            area.description.toLowerCase().includes(searchLower) ||
            getUnitName(area.unitId).toLowerCase().includes(searchLower);
    });
    const totalAreas = filteredAreas.length;
    const totalAreaPages = Math.ceil(totalAreas / itemsPerPage);
    const areaStartIndex = (currentPage - 1) * itemsPerPage;
    const areaEndIndex = areaStartIndex + itemsPerPage;
    const paginatedAreas = filteredAreas.slice(areaStartIndex, areaEndIndex);

    // Reset page when switching tabs
    // useEffect(() => {
    //     setCurrentPage(1);
    // }, [activeTab]);

    const handleNewForm = () => {
        navigate.push('/new-form');
        setIsMenuOpen(false);
    };

    const handleInspectorManagement = () => {
        navigate.push('/management/inspectors');
        setIsMenuOpen(false);
    };

    const handleViewChange = (view: string) => {
        if (view === 'forms') {
            navigate.push('/management');
        } else if (view === 'devices') {
            navigate.push('/management');
        }
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
        setIsMenuOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-900">{t.unitAreaManagement.title}</h1>
                        </div>
                        <div className="flex items-center space-x-3">
                            <LanguageToggle />
                            <UnitSelector />
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMenuOpen(false)}>
                    <div
                        className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-80 sm:w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-3">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">{t.nav.dashboard}</h3>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 rounded-md hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>
                            <button
                                onClick={handleNewForm}
                                className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200`}
                            >
                                <FilePlus className="w-6 h-6 flex-shrink-0" />
                                <span className="font-medium">{t.dashboard.newForm}</span>
                            </button>
                            {(isAdmin() || isMaster()) && (
                                <button
                                    onClick={handleInspectorManagement}
                                    className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors duration-200`}
                                >
                                    <Users className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-medium">{t.dashboard.manageInspectors}</span>
                                </button>
                            )}
                            {isMaster() && (
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-200`}
                                >
                                    <Building2 className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-medium">{t.unitAreaManagement.title}</span>
                                </button>
                            )}
                            <div className="border-t border-gray-200 my-4"></div>
                            <button
                                onClick={() => handleViewChange('forms')}
                                className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-50`}
                            >
                                <ClipboardList className="w-6 h-6 flex-shrink-0" />
                                <span className="font-medium">{t.dashboard.inspectionForms}</span>
                            </button>
                            {(isAdmin() || isMaster()) && (
                                <button
                                    onClick={() => handleViewChange('devices')}
                                    className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-50`}
                                >
                                    <Settings className="w-6 h-6 flex-shrink-0" />
                                    <span className="font-medium">{t.dashboard.deviceManagement}</span>
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200`}
                            >
                                <LogOut className="w-6 h-6 flex-shrink-0" />
                                <span className="font-medium">{t.nav.logout}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow">
                    {error && (
                        <div className="p-6 border-b border-gray-200">
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('units')}
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'units'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <Building2 className="w-4 h-4" />
                                    <span>{t.unitAreaManagement.units}</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setActiveTab('areas')}
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'areas'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <MapPin className="w-4 h-4" />
                                    <span>{t.unitAreaManagement.areas}</span>
                                </div>
                            </button>
                        </nav>
                    </div>

                    {/* Units Tab */}
                    {activeTab === 'units' && (
                        <div>
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => setShowAddUnitDialog(true)}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        {t.unitAreaManagement.addUnit}
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={t.common.search}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                    />
                                </div>

                                <div className="flex items-center space-x-2 mt-4">
                                    <span className={`text-sm text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {t.common.itemsPerPage || 'Items per page'}:
                                    </span>
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.name}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.code}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.description}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.deviceManagement.actions}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedUnits.map((unit) => (
                                            <tr key={unit.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingUnit?.id === unit.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingUnit.name}
                                                            onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{unit.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingUnit?.id === unit.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingUnit.code}
                                                            onChange={(e) => setEditingUnit({ ...editingUnit, code: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{unit.code}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {editingUnit?.id === unit.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingUnit.description}
                                                            onChange={(e) => setEditingUnit({ ...editingUnit, description: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{unit.description}</span>
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} text-sm font-medium space-x-2`}>
                                                    {editingUnit?.id === unit.id ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={handleUpdateUnit}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <Save className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingUnit(null)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setEditingUnit(unit)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setUnitToDelete(unit.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Areas Tab */}
                    {activeTab === 'areas' && (
                        <div>
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setShowAddAreaDialog(true)}
                                        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                                    >
                                        <Plus className="w-5 h-5 mr-2" />
                                        {t.unitAreaManagement.addArea}
                                    </button>
                                    <input
                                        type="text"
                                        placeholder={t.common.search}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.unit}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.name}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.code}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.unitAreaManagement.description}
                                            </th>
                                            <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                                {t.deviceManagement.actions}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {areas.map((area) => (
                                            <tr key={area.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingArea?.id === area.id ? (
                                                        <select
                                                            value={editingArea.unitId}
                                                            onChange={(e) => setEditingArea({ ...editingArea, unitId: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        >
                                                            {units.map(unit => (
                                                                <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{getUnitName(area.unitId)}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingArea?.id === area.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingArea.name}
                                                            onChange={(e) => setEditingArea({ ...editingArea, name: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{area.name}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {editingArea?.id === area.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingArea.code}
                                                            onChange={(e) => setEditingArea({ ...editingArea, code: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{area.code}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {editingArea?.id === area.id ? (
                                                        <input
                                                            type="text"
                                                            value={editingArea.description}
                                                            onChange={(e) => setEditingArea({ ...editingArea, description: e.target.value })}
                                                            className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                                        />
                                                    ) : (
                                                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>{area.description}</span>
                                                    )}
                                                </td>
                                                <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} text-sm font-medium space-x-2`}>
                                                    {editingArea?.id === area.id ? (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={handleUpdateArea}
                                                                className="text-green-600 hover:text-green-900"
                                                            >
                                                                <Save className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingArea(null)}
                                                                className="text-gray-600 hover:text-gray-900"
                                                            >
                                                                <X className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-end space-x-2">
                                                            <button
                                                                onClick={() => setEditingArea(area)}
                                                                className="text-blue-600 hover:text-blue-900"
                                                            >
                                                                <Pencil className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => setAreaToDelete(area.id)}
                                                                className="text-red-600 hover:text-red-900"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Areas Pagination */}
                            {totalAreaPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {t.common.showing || 'Showing'} {areaStartIndex + 1} {t.common.to || 'to'} {Math.min(areaEndIndex, totalAreas)} {t.common.of || 'of'} {totalAreas} {t.common.results || 'results'}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <div className="flex items-center space-x-1">
                                                {Array.from({ length: Math.min(5, totalAreaPages) }, (_, i) => {
                                                    let pageNum = 0;
                                                    if (totalAreaPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage <= 3) {
                                                        pageNum = i + 1;
                                                    } else if (currentPage >= totalAreaPages - 2) {
                                                        pageNum = totalAreaPages - 4 + i;
                                                    } else {
                                                        pageNum = currentPage - 2 + i;
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => setCurrentPage(pageNum)}
                                                            className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(Math.min(totalAreaPages, currentPage + 1))}
                                                disabled={currentPage === totalAreaPages}
                                                className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Unit Dialog */}
            {showAddUnitDialog && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                {t.unitAreaManagement.addUnit}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddUnitDialog(false);
                                    setAddUnitDialogError(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {addUnitDialogError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {addUnitDialogError}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.name}
                                </label>
                                <input
                                    type="text"
                                    value={newUnit.name}
                                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterUnitName}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.code}
                                </label>
                                <input
                                    type="text"
                                    value={newUnit.code}
                                    onChange={(e) => setNewUnit({ ...newUnit, code: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterUnitCode}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.description}
                                </label>
                                <input
                                    type="text"
                                    value={newUnit.description}
                                    onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterDescription}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowAddUnitDialog(false);
                                    setAddUnitDialogError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleAddUnit}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.unitAreaManagement.addUnit}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Area Dialog */}
            {showAddAreaDialog && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-gray-900">
                                {t.unitAreaManagement.addArea}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAddAreaDialog(false);
                                    setAddAreaDialogError(null);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {addAreaDialogError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {addAreaDialogError}
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.unit}
                                </label>
                                <select
                                    value={newArea.unitId}
                                    onChange={(e) => setNewArea({ ...newArea, unitId: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                >
                                    <option value="">{t.unitAreaManagement.selectUnit}</option>
                                    {units.map(unit => (
                                        <option key={unit.id} value={unit.id}>{unit.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.name}
                                </label>
                                <input
                                    type="text"
                                    value={newArea.name}
                                    onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterAreaName}
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.code}
                                </label>
                                <input
                                    type="text"
                                    value={newArea.code}
                                    onChange={(e) => setNewArea({ ...newArea, code: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterAreaCode}
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.unitAreaManagement.description}
                                </label>
                                <input
                                    type="text"
                                    value={newArea.description}
                                    onChange={(e) => setNewArea({ ...newArea, description: e.target.value })}
                                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                                    placeholder={t.unitAreaManagement.enterDescription}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowAddAreaDialog(false);
                                    setAddAreaDialogError(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleAddArea}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.unitAreaManagement.addArea}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Unit Confirmation Modal */}
            {unitToDelete && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t.unitAreaManagement.deleteUnit}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t.unitAreaManagement.deleteUnitConfirm}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setUnitToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleDeleteUnit}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {t.common.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Area Confirmation Modal */}
            {areaToDelete && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            {t.unitAreaManagement.deleteArea}
                        </h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {t.unitAreaManagement.deleteAreaConfirm}
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setAreaToDelete(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {t.common.cancel}
                            </button>
                            <button
                                onClick={handleDeleteArea}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {t.common.delete}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
