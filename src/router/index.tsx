
// src/router/index.tsx
import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import Login from '../pages/Login';
import InspectionForm from '../components2/InspectionForm';
import DeviceScanner from '../components2/DeviceScanner';
import FormDevices from '../components2/FormDevices';
import DeviceList from '../components2/DeviceList';
import DeviceDetails from '../components2/DeviceDetails';
import ManagementDashboard from '../components2/ManagementDashboard';
import InspectorManagement from '../components2/InspectorManagement';
import UnitAreaManagement from '../components2/UnitAreaManagement';
import DeviceManagement from '../components2/DeviceManagement';

import { useInspectionStore } from '../store/inspectionStore';
import MasterUserManagement from '../components2/MasterUserManagement';

export enum RouteNames {
  HOME = '/',
  LOGIN = '/login',
  NEW_FORM = '/new-form',
  INSPECTORS = '/management-dashboard/inspectors',
  DEEVICE_MENEGEMENT = '/device-management',
  SCAN = '/inspection/scan',
  INSPECTED_DEVICE_LIST = '/inspection/inspected',
  UNINSPECTED_DEVICE_LIST = '/inspection/uninspected',
  DEVICE_DETAILS = '/inspection/device/:deviceId',
  MANAGEMENT_DASHBOARD = '/management-dashboard',
  FORM_DEVICES = '/management/form/:formId',
  UNIT_AREA_MANAGEMENT = '/management/units-areas',
  MASTERS_USERS_MANAGEMENT = '/management/master/users',
}

const PrivateRoute: React.FC<{
  path: string;
  exact?: boolean;
  children?: React.ReactNode;
}> = ({ children, ...rest }) => {
  // אם אתה שומר משתמש ב-localStorage, תרגיש חופשי להשתמש ב-getCurrentUser().
  const state = useInspectionStore.getState();
  const user = state.getCurrentUser ? state.getCurrentUser() : state.currentUser;

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user ? (
          <>{children}</>
        ) : (
          <Redirect to={{ pathname: RouteNames.LOGIN, state: { from: location } }} />
        )
      }
    />
  );
};

export const AppRouter: React.FC = () => {
  return (
    <Switch>
      <Route exact path={RouteNames.LOGIN} component={Login} />

      <PrivateRoute exact path={RouteNames.MANAGEMENT_DASHBOARD}>
        <ManagementDashboard />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.INSPECTORS}>
        <InspectorManagement />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.MASTERS_USERS_MANAGEMENT}>
        <MasterUserManagement />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.NEW_FORM}>
        <InspectionForm />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.SCAN}>
        <DeviceScanner />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.INSPECTED_DEVICE_LIST}>
        <DeviceList />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.UNINSPECTED_DEVICE_LIST}>
        <DeviceList />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.DEVICE_DETAILS}>
        <DeviceDetails />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.FORM_DEVICES}>
        <FormDevices />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.UNIT_AREA_MANAGEMENT}>
        <UnitAreaManagement />
      </PrivateRoute>

      <PrivateRoute exact path={RouteNames.DEEVICE_MENEGEMENT}>
        <DeviceManagement />
      </PrivateRoute>

      {/* דף הבית -> לדשבורד */}
      <Redirect exact from={RouteNames.HOME} to={RouteNames.MANAGEMENT_DASHBOARD} />
      {/* נפילה כללית */}
      <Route render={() => <Redirect to={RouteNames.LOGIN} />} />
    </Switch>
  );
};
