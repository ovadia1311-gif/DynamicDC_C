
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useInspectionStore } from '../store/inspectionStore';
import { useTranslation } from '../i18n/useTranslations';
import LanguageToggle from './shared/LanguageToggle';
import UnitSelector from './shared/UnitSelector';
import DeviceManagement from './DeviceManagement';
import {
  ClipboardList, Filter, Trash2, LayoutGrid, Settings, Menu, X, LogOut,
  CheckCircle2, Clock, PlayCircle, AlertTriangle, FilePlus, Users, Building2,
  ChevronLeft, ChevronRight,
  Shield
} from 'lucide-react';

type View = 'forms' | 'devices' | 'users';
type FormStatus = 'all' | 'completed' | 'in_progress' | 'incomplete';

export default function ManagementDashboard() {
  const navigate = useHistory();
  const { t, isRTL } = useTranslation();
  const {
    forms,
    loadForms,
    deleteForm,
    setCurrentForm,
    isLoading,
    error,
    loadAllDevices,
    devices,
    areas,
    units,
    currentUser,
    initializeApp,
    isAdmin,
    isMaster,
    signOut,
    loadAreas,
    hasMoreForms,
    isLoadingMoreForms,
    loadMoreForms,
    formsDateRange
  } = useInspectionStore();
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<FormStatus>('all');
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('forms');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentUser) {
      initializeApp();
    }
  }, [currentUser, initializeApp]);

  // Reload data when selected unit changes
  const { selectedUnitId } = useInspectionStore();
  useEffect(() => {
    if (currentUser) {
      loadForms();
      loadAreas();
    }
  }, [selectedUnitId, currentUser, loadForms, loadAreas]);

  // Filter data based on user permissions
  const userUnits = isAdmin() ? units : units.filter(unit => unit.id === currentUser?.unitId);
  const effectiveUnitId = useInspectionStore.getState().getEffectiveUnitId();
  const userAreas = currentUser ? (
    (isAdmin() || isMaster())
      ? (effectiveUnitId ? areas.filter(area => area.unitId === effectiveUnitId) : areas)
      : areas.filter(area => area.unitId === currentUser.unitId)
  ) : [];

  const userForms = forms;
  //   isAdmin() ? forms : forms.filter(form =>
  //   userAreas.some(area => area.id === form.areaId)
  // );

  // Helper functions

  const getAreaName = (formId: string, areaId: string) => {
    const areaI = forms.find(form => form.id === formId)?.areaId;
    return areas.find(area => area.id === areaI)?.name || '';
  };

  const getFormStatus = (form: typeof forms[0]) => {
    if (!form.endTime) return 'in_progress';
    return form.devices.length === form.expectedDeviceCount ? 'completed' : 'incomplete';
  };

  // Event handlers
  const handleDeleteClick = (e: React.MouseEvent, formId: string) => {
    e.stopPropagation();
    setFormToDelete(formId);
  };

  const handleConfirmDelete = async () => {
    if (formToDelete) {
      try {
        await deleteForm(formToDelete);
        setFormToDelete(null);
      } catch (err) {
        console.error('Failed to delete form:', err);
      }
    }
  };

  const handleContinueInspection = (e: React.MouseEvent, form: typeof forms[0]) => {
    e.stopPropagation();
    setCurrentForm(form);
    navigate.push('/inspection/scan');
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };
  const handlFormsView = () => {
    navigate.push('');
    setIsMenuOpen(false);
  };

  const handleDevicesManagement = (view: View) => {
    setCurrentView(view);

    // navigate.push('/device-management');
    setIsMenuOpen(false);
  };

  const handleNewForm = () => {
    navigate.push('/new-form');
    setIsMenuOpen(false);
  };

  const handleInspectorManagement = () => {
    navigate.push('/management-dashboard/inspectors');
    setIsMenuOpen(false);
  };

  const handleUnitAreaManagement = () => {
    navigate.push('/management/units-areas');
    setIsMenuOpen(false);
  };

  const handleUsersManagement = () => {
    navigate.push('/management/master/users');
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

  // Filter forms
  const filteredForms = userForms.filter(form => {
    const matchesArea = areaFilter === 'all' || form.areaId === areaFilter;
    const matchesShift = shiftFilter === 'all' || form.shift === shiftFilter;

    const status = getFormStatus(form);
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    const matchesSearch = searchTerm === '' ||
      form.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getAreaName(form.id,form.areaId).toLowerCase().includes(searchTerm.toLowerCase());

    return matchesArea && matchesShift && matchesStatus && matchesSearch;
  });

  // Pagination calculations
  const totalItems = filteredForms.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedForms = filteredForms.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [areaFilter, shiftFilter, statusFilter, searchTerm]);

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentView === 'devices' ? (
                <>
                  <Settings className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">{t.deviceManagement.title}</h1>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-8 h-8 text-blue-600" />
                  <h1 className="text-2xl font-bold text-gray-900">{t.dashboard.title}</h1>
                </>
              )}
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
            className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-0 h-full w-80 sm:w-96 bg-white shadow-xl transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : 'translate-x-full')}`}
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
                <><button
                  onClick={handleUnitAreaManagement}
                  className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors duration-200`}
                >
                  <Building2 className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{t.unitAreaManagement.title}</span>
                </button>
                  <button
                    onClick={ handleUsersManagement}
                    className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg text-orange-600 bg-green-50 hover:bg-green-100 transition-colors duration-200 `}
                  >
                    <Shield className="w-6 h-6 flex-shrink-0" />
                    <span className="font-medium">{t.master.userManagementTitle}</span>
                  </button></>
              )}
              <div className="border-t border-gray-200 my-4"></div>
              <button
                onClick={() => handlFormsView()}
                className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg transition-colors duration-200 ${currentView === 'forms'
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <ClipboardList className="w-6 h-6 flex-shrink-0" />
                <span className="font-medium">{t.dashboard.inspectionForms}</span>
              </button>
              {(isAdmin() || isMaster()) && (
                <button
                  onClick={() => handleDevicesManagement('devices')}
                  className={`w-full flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 px-4 py-4 rounded-lg transition-colors duration-200 ${currentView === 'devices'
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Settings className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">{t.dashboard.deviceManagement}</span>
                </button>
              )}
              <div className="border-t border-gray-200 my-4"></div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentView === 'forms' ? (
          <div className="bg-white rounded-lg shadow">
            {/* Filters */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className={`text-lg font-semibold text-gray-900 flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                  <Filter className="w-6 h-6 flex-shrink-0" />
                  {t.dashboard.filters}
                </h2>
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder={t.common.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm px-3 py-2 ${isRTL ? 'text-right' : 'text-left'}`}
                  />
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="all">{t.dashboard.allAreas}</option>
                    {userAreas.map(area => (
                      <option key={area.id} value={area.id}>{area.name}</option>
                    ))}
                  </select>
                  <select
                    value={shiftFilter}
                    onChange={(e) => setShiftFilter(e.target.value)}
                    className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="all">{t.dashboard.allShifts}</option>
                    <option value="morning">{t.dashboard.morning}</option>
                    <option value="afternoon">{t.dashboard.afternoon}</option>
                    <option value="evening">{t.dashboard.evening}</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FormStatus)}
                    className={`rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="all">{t.dashboard.allStatus}</option>
                    <option value="completed">{t.dashboard.completed}</option>
                    <option value="incomplete">{t.dashboard.incomplete}</option>
                    <option value="in_progress">{t.dashboard.inProgress}</option>
                  </select>
                </div>
              </div>

              {/* Items per page selector */}
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
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

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
                <p className={`text-sm text-red-700 ${isRTL ? 'text-right' : 'text-left'}`}>{error}</p>
              </div>
            )}

            {/* Forms Table */}
            {!isLoading && !error && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.inspector}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.area}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.shift}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.time}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.status}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.devicesInspected}
                        </th>
                        <th scope="col" className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                          {t.dashboard.actions}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedForms.map((form) => {
                        const inspectedDevices = form.devices.length;
                        const progress = (inspectedDevices / form.expectedDeviceCount) * 100;
                        const status = getFormStatus(form);

                        return (
                          <tr
                            key={form.id}
                            onClick={() => navigate.push(`/management/form/${form.id}`)}
                            className="hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                          >
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {form.inspectorName}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {getAreaName(form.id,form.areaId)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize ${isRTL ? 'text-right' : 'text-left'}`}>
                              {t.dashboard[form.shift as keyof typeof t.dashboard] || form.shift}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {new Date(form.startTime).toLocaleString()}
                                {form.endTime && (
                                  <div className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                                    {t.dashboard.ended}: {new Date(form.endTime).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {status === 'completed' ? (
                                  <div className={`flex items-center text-green-700 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{t.dashboard.completed}</span>
                                  </div>
                                ) : status === 'incomplete' ? (
                                  <div className={`flex items-center text-orange-700 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{t.dashboard.incomplete}</span>
                                  </div>
                                ) : (
                                  <div className={`flex items-center text-amber-600 ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                                    <Clock className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{t.dashboard.inProgress}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className={`text-sm text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                                  {inspectedDevices} / {form.expectedDeviceCount} {t.dashboard.devices}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${status === 'completed' ? 'bg-green-600' :
                                      status === 'incomplete' ? 'bg-orange-600' :
                                        'bg-blue-600'
                                      }`}
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>
                              <div className={`flex items-center justify-end ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
                                {(status === 'in_progress' || status === 'incomplete') && (
                                  <button
                                    onClick={(e) => handleContinueInspection(e, form)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors duration-150"
                                    title={t.dashboard.continueInspection}
                                  >
                                    <PlayCircle className="w-5 h-5 flex-shrink-0" />
                                  </button>
                                )}
                                {(isAdmin() || isMaster()) && (
                                  <button
                                    onClick={(e) => handleDeleteClick(e, form.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-150"
                                    title={t.dashboard.deleteForm}
                                  >
                                    <Trash2 className="w-5 h-5 flex-shrink-0" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedForms.length === 0 && !isLoading && (
                        <tr>
                          <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                            <div className="py-8">
                              {filteredForms.length === 0 ? t.dashboard.noFormsFound : t.common.noResults || 'No results on this page'}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination */}
            {!isLoading && !error && totalPages > 1 && (
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

            {/* Load More Button */}
            {!isLoading && !error && hasMoreForms && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-center">
                <button
                  onClick={loadMoreForms}
                  disabled={isLoadingMoreForms}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingMoreForms ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                      {t.common.loading}
                    </>
                  ) : (
                    <>
                      <ChevronLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} transform ${isRTL ? '' : 'rotate-180'}`} />
                      {t.dashboard.loadMore || 'Load More Forms'}
                    </>
                  )}
                </button>
                <p className={`text-xs text-gray-500 mt-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                  {t.dashboard.showingFormsFrom || 'Showing forms from'} {formsDateRange.startDate.toLocaleDateString()} {t.dashboard.to || 'to'} {formsDateRange.endDate.toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <DeviceManagement />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {formToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t.dashboard.deleteForm}
            </h3>
            <p className={`text-sm text-gray-500 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.deviceManagement.deleteConfirm}
            </p>
            <div className={`flex justify-end ${isRTL ? 'space-x-reverse' : ''} space-x-3`}>
              <button
                onClick={() => setFormToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
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
