

// src/i18n/translations.ts

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    add: string;
    back: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    yes: string;
    no: string;
    search: string;
    filter: string;
    filtered: string;
    export: string;
    import: string;
    refresh: string;
    close: string;
    open: string;
    view: string;
    update: string;
    create: string;
    remove: string;
    select: string;
    clear: string;
    apply: string;
    reset: string;
    itemsPerPage: string;
    showing: string;
    to: string;
    of: string;
    results: string;
    noResults: string;
    actions: string;

    // ⬇️ NEW: used by MasterUserManagement
    role: string;
    active: string;
    inactive: string;
    name: string;
    email: string;
    unit: string;
    status: string;

    menu: string;
  };

  // Login
  login: {
    title: string;
    registerTitle: string;
    subtitle: string;
    registerSubtitle: string;
    email: string;
    password: string;
    name: string;
    unit: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    unitLabel: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    namePlaceholder: string;
    selectUnit: string;
    signIn: string;
    signUp: string;
    signingIn: string;
    signingUp: string;
    systemTitle: string;
    demoCredentials: string;
    createAccount: string;
    backToLogin: string;
  };

  // Navigation
  nav: {
    dashboard: string;
    devices: string;
    inspections: string;
    forms: string;
    inspectors: string;
    settings: string;
    logout: string;
    profile: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    newForm: string;
    manageInspectors: string;
    inspectionForms: string;
    deviceManagement: string;
    filters: string;
    allTerminals: string;
    allAreas: string;
    allUnits: string;
    allShifts: string;
    allStatus: string;
    terminal1: string;
    terminal3: string;
    morning: string;
    afternoon: string;
    evening: string;
    completed: string;
    incomplete: string;
    inProgress: string;
    inspector: string;
    terminal: string;
    area: string;
    shift: string;
    time: string;
    status: string;
    devicesInspected: string;
    actions: string;
    devices: string;
    continueInspection: string;
    deleteForm: string;
    noFormsFound: string;
    ended: string;
    loadMore: string;
    showingFormsFrom: string;
    to: string;

    // ⬇️ NEW: used by MasterUserManagement header
    unit: string;
  };

  // Optional user section (can be extended)
  user: Record<string, never>;

  // Inspection Form
  inspectionForm: {
    title: string;
    selectInspector: string;
    selectInspectorPlaceholder: string;
    terminal: string;
    shift: string;
    startInspection: string;
    devicesAvailable: string;
    backToDashboard: string;
  };

  // Device Scanner
  scanner: {
    title: string;
    currentSession: string;
    pointCamera: string;
    scannerPaused: string;
    inspectedDevices: string;
    pendingInspections: string;
    finishInspection: string;
    switchCamera: string;
    pauseScanner: string;
    resumeScanner: string;
    invalidDevice: string;
    deviceNotFound: string;
    processingError: string;
  };

  // Device Details
  deviceDetails: {
    title: string;
    updateDetails: string;
    completeInspection: string;
    deviceNumber: string;
    location: string;
    inspectionType: string;
    notes: string;
    routine: string;
    maintenance: string;
    repair: string;
    notesPlaceholder: string;
    saving: string;
    updateInspection: string;
    completeInspectionBtn: string;
    backToScanner: string;
  };

  // Device List
  deviceList: {
    inspectedDevices: string;
    pendingInspections: string;
    inspect: string;
    uninspect: string;
    noDevicesInspected: string;
    noDevicesPending: string;
    baCheck: string;
    note: string;
  };

  // Device Management
  deviceManagement: {
    title: string;
    addDevice: string;
    deviceNumber: string;
    location: string;
    baCheck: string;
    terminal: string;
    managerNotes: string;
    actions: string;
    addNewDevice: string;
    enterDeviceNumber: string;
    enterLocation: string;
    enterNotes: string;
    green: string;
    yellow: string;
    red: string;
    deleteDevice: string;
    deleteConfirm: string;
    deleteWarning: string;
    deviceNumberError: string;
    deviceExists: string;
    createFailed: string;
    updateFailed: string;
    deleteFailed: string;
  };

  // Inspector Management
  inspectorManagement: {
    title: string;
    addInspector: string;
    name: string;
    role: string;
    actions: string;
    inspector: string;
    manager: string;
    enterName: string;
    noInspectors: string;
    deleteInspector: string;
    deleteConfirm: string;
    deleteWarning: string;
  };

  // Form Details
  formDetails: {
    title: string;
    inspectionDetails: string;
    inspector: string;
    terminal: string;
    shift: string;
    status: string;
    exportToExcel: string;
    backToManagement: string;
    inspectionType: string;
    inspectionTime: string;
    inspectionNotes: string;
    noDevicesInspected: string;
  };

  // Unit Area Management
  unitAreaManagement: {
    title: string;
    units: string;
    areas: string;
    unit: string;
    name: string;
    code: string;
    description: string;
    addUnit: string;
    addArea: string;
    enterUnitName: string;
    enterUnitCode: string;
    enterAreaName: string;
    enterAreaCode: string;
    enterDescription: string;
    selectUnit: string;
    deleteUnit: string;
    selectArea: string;
    deleteArea: string;
    deleteUnitConfirm: string;
    deleteAreaConfirm: string;
  };

  // BA Check
  baCheck: {
    red: string;
    yellow: string;
    green: string;
  };

  // Status
  status: {
    completed: string;
    incomplete: string;
    inProgress: string;
  };

  // Errors
  errors: {
    loadingForms: string;
    loadingDevices: string;
    loadingInspectors: string;
    savingForm: string;
    updatingForm: string;
    deletingForm: string;
    savingDevice: string;
    updatingDevice: string;
    deletingDevice: string;
    savingInspector: string;
    updatingInspector: string;
    deletingInspector: string;
    invalidInput: string;
    networkError: string;
    unknownError: string;
  };

  // ⬇️ NEW: Master-only section
  master: {
    userManagementTitle: string;
    usersList: string;
    addUser: string;
  };

  // Forms (list & details combined)
  forms: {
    backToManagement: string;
    detailsTitle: string;
    formIdLabel: string;
    completed: string;
    inProgress: string;
    incomplete: string;
    progress: string;
    devicesCount: string;
    startTime: string;
    endTime: string;
    notCompleted: string;
    inspectedDevicesTitle: string;
    devices: string;
    noDevices: string;
    deviceNumber: string;
    location: string;
    managerNotes: string;
    inspectionType: string;
    inspectionTime: string;
    inspectionNotes: string;
    exportExcel: string;
    newForm: string
  };

}

export const translations: Record<'en' | 'he', Translations> = {
  en: {

    forms: {
      backToManagement: 'Back to Management',
      detailsTitle: 'Inspection Form Details',
      formIdLabel: 'Form ID',
      completed: 'Completed',
      inProgress: 'In Progress',
      incomplete: 'Incomplete',
      progress: 'Inspection progress',
      devicesCount: 'Devices count',
      startTime: 'Start time',
      endTime: 'End time',
      notCompleted: 'Not completed yet',
      inspectedDevicesTitle: 'Inspected devices',
      devices: 'devices',
      noDevices: 'No devices found for this form.',
      deviceNumber: 'Device Number',
      location: 'Location',
      managerNotes: 'Manager Notes',
      inspectionType: 'Inspection Type',
      inspectionTime: 'Inspection Time',
      inspectionNotes: 'Inspection Notes',
      exportExcel: 'Export to Excel',
      newForm: 'New Form',
    },

    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      search: 'Search',
      filter: 'Filter',
      filtered: 'Filtered',
      export: 'Export',
      import: 'Import',
      refresh: 'Refresh',
      close: 'Close',
      open: 'Open',
      view: 'View',
      update: 'Update',
      create: 'Create',
      remove: 'Remove',
      select: 'Select',
      clear: 'Clear',
      apply: 'Apply',
      reset: 'Reset',
      itemsPerPage: 'Items per page',
      showing: 'Showing',
      to: 'to',
      of: 'of',
      results: 'results',
      noResults: 'No results',
      actions: 'Actions',

      // NEW
      role: 'Role',
      active: 'Active',
      inactive: 'Inactive',
      name: 'Name',
      email: 'Username',
      unit: 'Unit',
      status: 'Status',

      menu: 'Menu',
    },

    login: {
      title: 'Device Inspection',
      registerTitle: 'Create Account',
      subtitle: 'Sign in to access the system',
      registerSubtitle: 'Create a new account to access the system',
      email: 'Username',
      password: 'Password',
      name: 'Full Name',
      unit: 'Unit',
      emailLabel: 'Username',
      passwordLabel: 'Password',
      nameLabel: 'Full Name',
      unitLabel: 'Unit',
      emailPlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      namePlaceholder: 'Enter your full name',
      selectUnit: 'Select your unit',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signingIn: 'Signing in...',
      signingUp: 'Creating account...',
      systemTitle: 'Device Inspection Management System',
      demoCredentials: 'Demo: admin@example.com or user1@example.com with password "password"',
      createAccount: 'Create new account',
      backToLogin: 'Back to login',
    },

    nav: {
      dashboard: 'Dashboard',
      devices: 'Devices',
      inspections: 'Inspections',
      forms: 'Forms',
      inspectors: 'Inspectors',
      settings: 'Settings',
      logout: 'Logout',
      profile: 'Profile',
    },

    dashboard: {
      title: 'Management Dashboard',
      newForm: 'New Form',
      manageInspectors: 'Manage Inspectors',
      inspectionForms: 'Inspection Forms',
      deviceManagement: 'Device Management',
      filters: 'Filters',
      allTerminals: 'All Terminals',
      allAreas: 'All Areas',
      allUnits: 'All Units',
      allShifts: 'All Shifts',
      allStatus: 'All Status',
      terminal1: 'Terminal 1',
      terminal3: 'Terminal 3',
      morning: 'Morning',
      afternoon: 'Afternoon',
      evening: 'Evening',
      completed: 'Completed',
      incomplete: 'Incomplete',
      inProgress: 'In Progress',
      inspector: 'Inspector',
      terminal: 'Terminal',
      area: 'Area',
      shift: 'Shift',
      time: 'Time',
      status: 'Status',
      devicesInspected: 'Devices Inspected',
      actions: 'Actions',
      devices: 'Devices',
      continueInspection: 'Continue inspection',
      deleteForm: 'Delete form',
      noFormsFound: 'No inspection forms found matching the selected filters.',
      ended: 'Ended',
      loadMore: 'Load more',
      showingFormsFrom: 'Showing forms from',
      to: 'to',

      // NEW
      unit: 'Unit',
    },

    user: {},

    inspectionForm: {
      title: 'New Inspection Form',
      selectInspector: 'Select Inspector',
      selectInspectorPlaceholder: 'Select an inspector',
      terminal: 'Terminal',
      shift: 'Shift',
      startInspection: 'Start Inspection',
      devicesAvailable: 'devices available for inspection in',
      backToDashboard: 'Back to Dashboard',
    },

    scanner: {
      title: 'Current Inspection Session',
      currentSession: 'Current Inspection Session',
      pointCamera: 'Point your camera at a QR code to scan',
      scannerPaused: 'Scanner paused',
      inspectedDevices: 'Inspected Devices',
      pendingInspections: 'Pending Inspections',
      finishInspection: 'Finish Inspection',
      switchCamera: 'Switch camera',
      pauseScanner: 'Pause scanner',
      resumeScanner: 'Resume scanner',
      invalidDevice: 'Invalid device number. Please scan a valid QR code.',
      deviceNotFound: 'Device not found. Please try again.',
      processingError: 'Error processing QR code. Please try again.',
    },

    deviceDetails: {
      title: 'Device Details',
      updateDetails: 'Update inspection details',
      completeInspection: 'Complete device inspection',
      deviceNumber: 'Device Number',
      location: 'Location',
      inspectionType: 'Inspection Type',
      notes: 'Notes',
      routine: 'BO Check',
      maintenance: 'Maintenance',
      repair: 'Repair',
      notesPlaceholder: 'Enter any observations or issues...',
      saving: 'Saving...',
      updateInspection: 'Update Inspection',
      completeInspectionBtn: 'Complete Inspection',
      backToScanner: 'Back to Scanner',
    },

    deviceList: {
      inspectedDevices: 'Inspected Devices',
      pendingInspections: 'Pending Inspections',
      inspect: 'Inspect',
      uninspect: 'Cancel Inspection',
      noDevicesInspected: 'No devices inspected in',
      noDevicesPending: 'No devices pending in',
      baCheck: 'BA Check',
      note: 'Note',
    },

    deviceManagement: {
      title: 'Device Management',
      addDevice: 'Add Device',
      deviceNumber: 'Device Number',
      location: 'Location',
      baCheck: 'BA Check',
      terminal: 'Terminal',
      managerNotes: 'Manager Notes',
      actions: 'Actions',
      addNewDevice: 'Add New Device',
      enterDeviceNumber: 'Enter 5-digit number',
      enterLocation: 'Enter location',
      enterNotes: 'Enter notes',
      green: 'Green',
      yellow: 'Yellow',
      red: 'Red',
      deleteDevice: 'Delete Device',
      deleteConfirm: 'Are you sure you want to delete this device? This action cannot be undone.',
      deleteWarning: 'This action cannot be undone.',
      deviceNumberError: 'Device number must be exactly 5 digits',
      deviceExists: 'Device number already exists',
      createFailed: 'Failed to create device. Please try again.',
      updateFailed: 'Failed to update device. Please try again.',
      deleteFailed: 'Failed to delete device. Please try again.',
    },

    inspectorManagement: {
      title: 'Inspector Management',
      addInspector: 'Add Inspector',
      name: 'Name',
      role: 'Role',
      actions: 'Actions',
      inspector: 'Inspector',
      manager: 'Manager',
      enterName: 'Enter inspector name',
      noInspectors: 'No inspectors found.',
      deleteInspector: 'Delete Inspector',
      deleteConfirm: 'Are you sure you want to delete this inspector? This action cannot be undone.',
      deleteWarning: 'This action cannot be undone.',
    },

    formDetails: {
      title: 'Inspection Details',
      inspectionDetails: 'Inspection Details',
      inspector: 'Inspector',
      terminal: 'Terminal',
      shift: 'Shift',
      status: 'Status',
      exportToExcel: 'Export to Excel',
      backToManagement: 'Back to Management',
      inspectionType: 'Inspection Type',
      inspectionTime: 'Inspection Time',
      inspectionNotes: 'Inspection Notes',
      noDevicesInspected: 'No devices have been inspected in this form.',
    },

    unitAreaManagement: {
      title: 'Units and Areas Management',
      units: 'Units',
      areas: 'Areas',
      unit: 'Unit',
      name: 'Name',
      code: 'Code',
      description: 'Description',
      addUnit: 'Add Unit',
      addArea: 'Add Area',
      enterUnitName: 'Enter unit name',
      enterUnitCode: 'Enter unit code',
      enterAreaName: 'Enter area name',
      enterAreaCode: 'Enter area code',
      enterDescription: 'Enter description',
      selectUnit: 'Select unit',
      selectArea: 'Select area',
      deleteUnit: 'Delete Unit',
      deleteArea: 'Delete Area',
      deleteUnitConfirm:
        'Are you sure you want to delete this unit? This will also delete all associated areas and data.',
      deleteAreaConfirm:
        'Are you sure you want to delete this area? This will also delete all associated data.',
    },

    baCheck: {
      red: 'Red',
      yellow: 'Yellow',
      green: 'Green',
    },

    status: {
      completed: 'Completed',
      incomplete: 'Incomplete',
      inProgress: 'In Progress',
    },

    errors: {
      loadingForms: 'Failed to load forms',
      loadingDevices: 'Failed to load devices',
      loadingInspectors: 'Failed to load inspectors',
      savingForm: 'Failed to save form. Please try again.',
      updatingForm: 'Failed to update form. Please try again.',
      deletingForm: 'Failed to delete form. Please try again.',
      savingDevice: 'Failed to save device. Please try again.',
      updatingDevice: 'Failed to update device. Please try again.',
      deletingDevice: 'Failed to delete device. Please try again.',
      savingInspector: 'Failed to save inspector. Please try again.',
      updatingInspector: 'Failed to update inspector. Please try again.',
      deletingInspector: 'Failed to delete inspector. Please try again.',
      invalidInput: 'Invalid input. Please check your data.',
      networkError: 'Network error. Please check your connection.',
      unknownError: 'An unknown error occurred. Please try again.',
    },

    // NEW
    master: {
      userManagementTitle: 'Master · User Management',
      usersList: 'Users List',
      addUser: 'Add User',
    },
  },

  he: {

    forms: {
      backToManagement: 'חזור לניהול',
      detailsTitle: 'פרטי טופס בדיקה',
      formIdLabel: 'מספר טופס',
      completed: 'הושלם',
      inProgress: 'בתהליך',
      incomplete: 'לא הושלם',
      progress: 'התקדמות הבדיקה',
      devicesCount: 'כמות מכשירים',
      startTime: 'שעת התחלה',
      endTime: 'שעת סיום',
      notCompleted: 'טרם הסתיים',
      inspectedDevicesTitle: 'מכשירים שנבדקו',
      devices: 'מכשירים',
      noDevices: 'לא נמצאו מכשירים בטופס זה.',
      deviceNumber: 'מספר מכשיר',
      location: 'מיקום',
      managerNotes: 'הערות מנהל',
      inspectionType: 'סוג בדיקה',
      inspectionTime: 'זמן בדיקה',
      inspectionNotes: 'הערות בדיקה',
      exportExcel: 'ייצוא לאקסל',
      newForm: 'טופס חדש'
    },

    common: {
      save: 'שמור',
      cancel: 'בטל',
      delete: 'מחק',
      edit: 'ערוך',
      add: 'הוסף',
      back: 'חזור',
      loading: 'טוען...',
      error: 'שגיאה',
      success: 'הצלחה',
      confirm: 'אשר',
      yes: 'כן',
      no: 'לא',
      search: 'חפש',
      filter: 'סנן',
      filtered: 'מסונן',
      export: 'ייצא',
      import: 'ייבא',
      refresh: 'רענן',
      close: 'סגור',
      open: 'פתח',
      view: 'הצג',
      update: 'עדכן',
      create: 'צור',
      remove: 'הסר',
      select: 'בחר',
      clear: 'נקה',
      apply: 'החל',
      reset: 'אפס',
      itemsPerPage: 'פריטים בעמוד',
      showing: 'מציג',
      to: 'עד',
      of: 'מתוך',
      results: 'תוצאות',
      noResults: 'אין תוצאות',
      actions: 'פעולות',

      // NEW
      role: 'תפקיד',
      active: 'פעיל',
      inactive: 'לא פעיל',
      name: 'שם',
      email: 'שם משתמש',
      unit: 'יחידה',
      status: 'סטטוס',
      menu: 'תפריט'
    },

    login: {
      title: 'בדיקת מכשירים',
      registerTitle: 'יצירת חשבון',
      subtitle: 'התחבר כדי לגשת למערכת',
      registerSubtitle: 'צור חשבון חדש כדי לגשת למערכת',
      email: 'שם משתמש',
      password: 'סיסמה',
      name: 'שם מלא',
      unit: 'יחידה',
      emailLabel: 'שם משתמש',
      passwordLabel: 'סיסמה',
      nameLabel: 'שם מלא',
      unitLabel: 'יחידה',
      emailPlaceholder: 'הכנס שם משתמש',
      passwordPlaceholder: 'הכנס סיסמה',
      namePlaceholder: 'הכנס שם מלא',
      selectUnit: 'בחר יחידה',
      signIn: 'התחבר',
      signUp: 'הירשם',
      signingIn: 'מתחבר...',
      signingUp: 'יוצר חשבון...',
      systemTitle: 'מערכת ניהול בדיקת מכשירים',
      demoCredentials: 'דמו: admin@example.com או user1@example.com עם סיסמה "password"',
      createAccount: 'צור חשבון חדש',
      backToLogin: 'חזור להתחברות',
    },

    nav: {
      dashboard: 'לוח בקרה',
      devices: 'מכשירים',
      inspections: 'בדיקות',
      forms: 'טפסים',
      inspectors: 'בודקים',
      settings: 'הגדרות',
      logout: 'התנתק',
      profile: 'פרופיל',
    },

    dashboard: {
      title: 'לוח בקרה ניהולי',
      newForm: 'טופס חדש',
      manageInspectors: 'נהל בודקים',
      inspectionForms: 'טפסי בדיקה',
      deviceManagement: 'ניהול מכשירים',
      filters: 'מסננים',
      allTerminals: 'כל הטרמינלים',
      allAreas: 'כל האזורים',
      allUnits: 'כל היחידות',
      allShifts: 'כל המשמרות',
      allStatus: 'כל הסטטוסים',
      terminal1: 'טרמינל 1',
      terminal3: 'טרמינל 3',
      morning: 'בוקר',
      afternoon: 'צהריים',
      evening: 'ערב',
      completed: 'הושלם',
      incomplete: 'לא הושלם',
      inProgress: 'בתהליך',
      inspector: 'בודק',
      terminal: 'טרמינל',
      area: 'אזור',
      shift: 'משמרת',
      time: 'זמן',
      status: 'סטטוס',
      devicesInspected: 'מכשירים שנבדקו',
      actions: 'פעולות',
      devices: 'מכשירים',
      continueInspection: 'המשך בדיקה',
      deleteForm: 'מחק טופס',
      noFormsFound: 'לא נמצאו טפסי בדיקה התואמים למסננים שנבחרו.',
      ended: 'הסתיים',
      loadMore: 'טען עוד',
      showingFormsFrom: 'מציג טפסים מ',
      to: 'עד',

      // NEW
      unit: 'יחידה',
    },

    user: {},

    inspectionForm: {
      title: 'טופס בדיקה חדש',
      selectInspector: 'בחר בודק',
      selectInspectorPlaceholder: 'בחר בודק',
      terminal: 'טרמינל',
      shift: 'משמרת',
      startInspection: 'התחל בדיקה',
      devicesAvailable: 'מכשירים זמינים לבדיקה ב',
      backToDashboard: 'חזור ללוח הבקרה',
    },

    scanner: {
      title: 'סשן בדיקה נוכחי',
      currentSession: 'סשן בדיקה נוכחי',
      pointCamera: 'כוון את המצלמה לקוד QR כדי לסרוק',
      scannerPaused: 'הסורק מושהה',
      inspectedDevices: 'מכשירים שנבדקו',
      pendingInspections: 'בדיקות ממתינות',
      finishInspection: 'סיים בדיקה',
      switchCamera: 'החלף מצלמה',
      pauseScanner: 'השהה סורק',
      resumeScanner: 'המשך סריקה',
      invalidDevice: 'מספר מכשיר לא תקין. אנא סרוק קוד QR תקין.',
      deviceNotFound: 'מכשיר לא נמצא. אנא נסה שוב.',
      processingError: 'שגיאה בעיבוד קוד QR. אנא נסה שוב.',
    },

    deviceDetails: {
      title: 'פרטי מכשיר',
      updateDetails: 'עדכן פרטי בדיקה',
      completeInspection: 'השלם בדיקת מכשיר',
      deviceNumber: 'מספר מכשיר',
      location: 'מיקום',
      inspectionType: 'סוג בדיקה',
      notes: 'הערות',
      routine: 'בדיקה BO',
      maintenance: 'תחזוקה',
      repair: 'תיקון',
      notesPlaceholder: 'הכנס תצפיות או בעיות...',
      saving: 'שומר...',
      updateInspection: 'עדכן בדיקה',
      completeInspectionBtn: 'השלם בדיקה',
      backToScanner: 'חזור לסורק',
    },

    deviceList: {
      inspectedDevices: 'מכשירים שנבדקו',
      pendingInspections: 'בדיקות ממתינות',
      inspect: 'בדוק',
      uninspect: 'בטל בדיקה',
      noDevicesInspected: 'אין מכשירים שנבדקו ב',
      noDevicesPending: 'אין מכשירים ממתינים ב',
      baCheck: 'בדיקת BA',
      note: 'הערה',
    },

    deviceManagement: {
      title: 'ניהול מכשירים',
      addDevice: 'הוסף מכשיר',
      deviceNumber: 'מספר מכשיר',
      location: 'מיקום',
      baCheck: 'בדיקת BA',
      terminal: 'טרמינל',
      managerNotes: 'הערות מנהל',
      actions: 'פעולות',
      addNewDevice: 'הוסף מכשיר חדש',
      enterDeviceNumber: 'הכנס מספר בן 5 ספרות',
      enterLocation: 'הכנס מיקום',
      enterNotes: 'הכנס הערות',
      green: 'ירוק',
      yellow: 'צהוב',
      red: 'אדום',
      deleteDevice: 'מחק מכשיר',
      deleteConfirm: 'האם אתה בטוח שברצונך למחוק מכשיר זה? פעולה זו לא ניתנת לביטול.',
      deleteWarning: 'פעולה זו לא ניתנת לביטול.',
      deviceNumberError: 'מספר מכשיר חייב להיות בדיוק 5 ספרות',
      deviceExists: 'מספר מכשיר כבר קיים',
      createFailed: 'יצירת מכשיר נכשלה. אנא נסה שוב.',
      updateFailed: 'עדכון מכשיר נכשל. אנא נסה שוב.',
      deleteFailed: 'מחיקת מכשיר נכשלה. אנא נסה שוב.',
    },

    inspectorManagement: {
      title: 'ניהול בודקים',
      addInspector: 'הוסף בודק',
      name: 'שם',
      role: 'תפקיד',
      actions: 'פעולות',
      inspector: 'בודק',
      manager: 'מנהל',
      enterName: 'הכנס שם בודק',
      noInspectors: 'לא נמצאו בודקים.',
      deleteInspector: 'מחק בודק',
      deleteConfirm: 'האם אתה בטוח שברצונך למחוק בודק זה? פעולה זו לא ניתנת לביטול.',
      deleteWarning: 'פעולה זו לא ניתנת לביטול.',
    },

    formDetails: {
      title: 'פרטי בדיקה',
      inspectionDetails: 'פרטי בדיקה',
      inspector: 'בודק',
      terminal: 'טרמינל',
      shift: 'משמרת',
      status: 'סטטוס',
      exportToExcel: 'ייצא לאקסל',
      backToManagement: 'חזור לניהול',
      inspectionType: 'סוג בדיקה',
      inspectionTime: 'זמן בדיקה',
      inspectionNotes: 'הערות בדיקה',
      noDevicesInspected: 'לא נבדקו מכשירים בטופס זה.',
    },

    unitAreaManagement: {
      title: 'ניהול יחידות ואזורים',
      units: 'יחידות',
      areas: 'אזורים',
      unit: 'יחידה',
      name: 'שם',
      code: 'קוד',
      description: 'תיאור',
      addUnit: 'הוסף יחידה',
      addArea: 'הוסף אזור',
      enterUnitName: 'הכנס שם יחידה',
      enterUnitCode: 'הכנס קוד יחידה',
      enterAreaName: 'הכנס שם אזור',
      enterAreaCode: 'הכנס קוד אזור',
      enterDescription: 'הכנס תיאור',
      selectUnit: 'בחר יחידה',
      selectArea: 'בחר איזור',
      deleteUnit: 'מחק יחידה',
      deleteArea: 'מחק אזור',
      deleteUnitConfirm:
        'האם אתה בטוח שברצונך למחוק יחידה זו? פעולה זו תמחק גם את כל האזורים והנתונים הקשורים.',
      deleteAreaConfirm:
        'האם אתה בטוח שברצונך למחוק אזור זה? פעולה זו תמחק גם את כל הנתונים הקשורים.',
    },

    baCheck: {
      red: 'אדום',
      yellow: 'צהוב',
      green: 'ירוק',
    },

    status: {
      completed: 'הושלם',
      incomplete: 'לא הושלם',
      inProgress: 'בתהליך',
    },

    errors: {
      loadingForms: 'טעינת טפסים נכשלה',
      loadingDevices: 'טעינת מכשירים נכשלה',
      loadingInspectors: 'טעינת בודקים נכשלה',
      savingForm: 'שמירת טופס נכשלה. אנא נסה שוב.',
      updatingForm: 'עדכון טופס נכשל. אנא נסה שוב.',
      deletingForm: 'מחיקת טופס נכשלה. אנא נסה שוב.',
      savingDevice: 'שמירת מכשיר נכשלה. אנא נסה שוב.',
      updatingDevice: 'עדכון מכשיר נכשל. אנא נסה שוב.',
      deletingDevice: 'מחיקת מכשיר נכשלה. אנא נסה שוב.',
      savingInspector: 'שמירת בודק נכשלה. אנא נסה שוב.',
      updatingInspector: 'עדכון בודק נכשל. אנא נסה שוב.',
      deletingInspector: 'מחיקת בודק נכשלה. אנא נסה שוב.',
      invalidInput: 'קלט לא תקין. אנא בדוק את הנתונים.',
      networkError: 'שגיאת רשת. אנא בדוק את החיבור.',
      unknownError: 'אירעה שגיאה לא ידועה. אנא נסה שוב.',
    },

    // NEW
    master: {
      userManagementTitle: 'מאסטר · ניהול משתמשים',
      usersList: 'רשימת משתמשים',
      addUser: 'הוסף משתמש',
    },
  },
};
