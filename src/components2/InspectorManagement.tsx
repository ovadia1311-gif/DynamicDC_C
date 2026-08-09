

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Users, UserPlus, Pencil, Trash2, X, Save, Menu, FilePlus, Building2, LogOut, ClipboardList, Settings, ChevronLeft, ChevronRight }
  from 'lucide-react';
import type { Inspector, InspectorRole } from '../types/inspection';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';

export default function InspectorManagement() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();
  const {
    inspectors,
    addInspector,
    updateInspector,
    deleteInspector,
    isLoadingInspectors: isLoading,
    inspectorsError: error,
    units,
    currentUser,
    initializeApp,
    isAdmin,
    isMaster,
    signOut
  } = useInspectionStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingInspector, setEditingInspector] = useState<Inspector | null>(null);
  const [inspectorToDelete, setInspectorToDelete] = useState<string | null>(null);
  const [newInspector, setNewInspector] = useState<Omit<Inspector, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    role: 'inspector',
    unitId: ''
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) {
      initializeApp();
    } else {
      // Set default unit for admin users
      if (isAdmin() && !isMaster() && currentUser.unitId) {
        setNewInspector(prev => ({ ...prev, unitId: currentUser.unitId }));
      }
    }
  }, [currentUser, initializeApp, isAdmin, isMaster]);

  // Update newInspector unitId when currentUser changes (for admin users)
  useEffect(() => {
    if (currentUser && isAdmin() && !isMaster() && currentUser.unitId && !newInspector.unitId) {
      setNewInspector(prev => ({ ...prev, unitId: currentUser.unitId }));
    }
  }, [currentUser, isAdmin, isMaster, newInspector.unitId]);

  // Filter data based on user permissions
  const userUnits = isAdmin() ? units : units.filter(unit => unit.id === currentUser?.unitId);
  const userInspectors = (isAdmin() ? inspectors : inspectors.filter(inspector => inspector.unitId === currentUser?.unitId))
    .filter(inspector => {
      if (searchTerm === '') return true;
      const searchLower = searchTerm.toLowerCase();
      return inspector.name.toLowerCase().includes(searchLower) ||
        inspector.role.toLowerCase().includes(searchLower) ||
        userUnits.find(unit => unit.id === inspector.unitId)?.name.toLowerCase().includes(searchLower);
    });

  // Pagination calculations
  const totalItems = userInspectors.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInspectors = userInspectors.slice(startIndex, endIndex);

  const handleAddInspector = async () => {
    try {
      await addInspector(newInspector);
      setShowAddDialog(false);
      setNewInspector({ name: '', role: 'inspector', unitId: '' });
    } catch (err) {
      console.error('Error adding inspector:', err);
    }
  };

  const handleUpdateInspector = async () => {
    if (!editingInspector) return;

    try {
      await updateInspector(editingInspector);
      setEditingInspector(null);
    } catch (err) {
      console.error('Error updating inspector:', err);
    }
  };

  const handleDeleteInspector = async () => {
    if (!inspectorToDelete) return;

    try {
      await deleteInspector(inspectorToDelete);
      setInspectorToDelete(null);
    } catch (err) {
      console.error('Error deleting inspector:', err);
    }
  };

  const getUnitName = (unitId: string) => {
    return userUnits.find(u => u.id === unitId)?.name || '';
  };

  const handleNewForm = () => {
    navigate.push('/new-form');
    setIsMenuOpen(false);
  };

  const handleUnitAreaManagement = () => {
    navigate.push('/management/units-areas');
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
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{t.inspectorManagement.title}</h1>
            </div>
            <div className="flex items-center space-x-3">
              <LanguageToggle />
              <UnitSelector />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
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
                  onClick={() => setIsMenuOpen(false)}
                  className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors duration-200`}
                >
                  <Users className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{t.dashboard.manageInspectors}</span>
                </button>
              )}
              {isMaster() && (
                <button
                  onClick={handleUnitAreaManagement}
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAddDialog(true)}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t.inspectorManagement.addInspector}
                </button>
                <input
                  type="text"
                  placeholder={t.common.search}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>

              <div className="flex items-center space-x-2">
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
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t.inspectorManagement.name}
                  </th>
                  <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t.inspectorManagement.role}
                  </th>
                  <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t.unitAreaManagement.unit}
                  </th>
                  <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                    {t.inspectorManagement.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedInspectors.map((inspector) => (
                  <tr key={inspector.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingInspector?.id === inspector.id ? (
                        <input
                          type="text"
                          value={editingInspector.name}
                          onChange={(e) => setEditingInspector({ ...editingInspector, name: e.target.value })}
                          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        />
                      ) : (
                        <span className={`text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>{inspector.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingInspector?.id === inspector.id ? (
                        <select
                          value={editingInspector.role}
                          onChange={(e) => setEditingInspector({ ...editingInspector, role: e.target.value as InspectorRole })}
                          className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                        >
                          <option value="inspector">{t.inspectorManagement.inspector}</option>
                          <option value="manager">{t.inspectorManagement.manager}</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${inspector.role === 'manager' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                          {t.inspectorManagement[inspector.role as keyof typeof t.inspectorManagement] || inspector.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingInspector?.id === inspector.id ? (
                        isAdmin() && !isMaster() ? (
                          // Admin user - show their unit only, no selection
                          <div className={`px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {getUnitName(editingInspector.unitId? editingInspector.unitId : '')}
                          </div>
                        ) : (
                          // Master user - can select from all units
                          <select
                            value={editingInspector.unitId}
                            onChange={(e) => setEditingInspector({ ...editingInspector, unitId: e.target.value })}
                            className={`rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                          >
                            {userUnits.map(unit => (
                              <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                          </select>
                        )
                      ) : (
                        <span className={`text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {getUnitName(inspector.unitId? inspector.unitId: '')}
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} text-sm font-medium`}>
                      {editingInspector?.id === inspector.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={handleUpdateInspector}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingInspector(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            {t.common.cancel}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingInspector(inspector)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setInspectorToDelete(inspector.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {paginatedInspectors.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      {userInspectors.length === 0 ? t.inspectorManagement.noInspectors : (t.common.noResults || 'No results on this page')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className={`text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.common.showing || 'Showing'} {startIndex + 1} {t.common.to || 'to'} {Math.min(endIndex, totalItems)} {t.common.of || 'of'} {totalItems} {t.common.results || 'results'}
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
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = 0;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 bg-white text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Inspector Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {t.inspectorManagement.addInspector}
              </h3>
              <button
                onClick={() => setShowAddDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.inspectorManagement.name}
                </label>
                <input
                  type="text"
                  value={newInspector.name}
                  onChange={(e) => setNewInspector({ ...newInspector, name: e.target.value })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  placeholder={t.inspectorManagement.enterName}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.inspectorManagement.role}
                </label>
                <select
                  value={newInspector.role}
                  onChange={(e) => setNewInspector({ ...newInspector, role: e.target.value as InspectorRole })}
                  className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="inspector">{t.inspectorManagement.inspector}</option>
                  <option value="manager">{t.inspectorManagement.manager}</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.unitAreaManagement.unit}
                </label>
                {isAdmin() && !isMaster() ? (
                  // Admin user - show their unit only, no selection
                  <div className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                    {userUnits.find(unit => unit.id === currentUser?.unitId)?.name || ''}
                  </div>
                ) : (
                  // Master user - can select from all units
                  <select
                    value={newInspector.unitId}
                    onChange={(e) => setNewInspector({ ...newInspector, unitId: e.target.value })}
                    className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="">{t.unitAreaManagement.selectUnit}</option>
                    {userUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleAddInspector}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.inspectorManagement.addInspector}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {inspectorToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t.inspectorManagement.deleteInspector}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {t.inspectorManagement.deleteConfirm}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setInspectorToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteInspector}
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
