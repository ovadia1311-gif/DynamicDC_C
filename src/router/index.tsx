import React from 'react';
import {
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';

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
import MasterUserManagement from '../components2/MasterUserManagement';

import { useInspectionStore } from '../store/inspectionStore';

export enum RouteNames {
  HOME = '/',
  LOGIN = '/login',
  NEW_FORM = '/new-form',

  INSPECTORS =
    '/management-dashboard/inspectors',

  DEEVICE_MENEGEMENT =
    '/device-management',

  SCAN = '/inspection/scan',

  INSPECTED_DEVICE_LIST =
    '/inspection/inspected',

  UNINSPECTED_DEVICE_LIST =
    '/inspection/uninspected',

  DEVICE_DETAILS =
    '/inspection/device/:deviceId',

  MANAGEMENT_DASHBOARD =
    '/management-dashboard',

  FORM_DEVICES =
    '/management/form/:formId',

  UNIT_AREA_MANAGEMENT =
    '/management/units-areas',

  MASTERS_USERS_MANAGEMENT =
    '/management/master/users',
}

type AllowedRole =
  | 'user'
  | 'admin'
  | 'master';

function normalizeRole(
  value: any
): AllowedRole {
  const role = String(
    value ?? 'user'
  )
    .trim()
    .toLowerCase();

  if (role === 'master') {
    return 'master';
  }

  if (role === 'admin') {
    return 'admin';
  }

  return 'user';
}

const PrivateRoute: React.FC<{
  path: string;
  exact?: boolean;
  children?: React.ReactNode;
}> = ({
  children,
  ...rest
}) => {
  const currentUser =
    useInspectionStore(
      (state) =>
        state.currentUser
    );

  const user =
    currentUser ??
    useInspectionStore
      .getState()
      .getCurrentUser();

  return (
    <Route
      {...rest}
      render={({ location }) =>
        user ? (
          <>{children}</>
        ) : (
          <Redirect
            to={{
              pathname:
                RouteNames.LOGIN,
              state: {
                from: location,
              },
            }}
          />
        )
      }
    />
  );
};

const RoleRoute: React.FC<{
  path: string;
  exact?: boolean;
  allowedRoles: AllowedRole[];
  children?: React.ReactNode;
}> = ({
  children,
  allowedRoles,
  ...rest
}) => {
  const currentUser =
    useInspectionStore(
      (state) =>
        state.currentUser
    );

  const user =
    currentUser ??
    useInspectionStore
      .getState()
      .getCurrentUser();

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!user) {
          return (
            <Redirect
              to={{
                pathname:
                  RouteNames.LOGIN,
                state: {
                  from: location,
                },
              }}
            />
          );
        }

        const role =
          normalizeRole(
            user.role
          );

        if (
          !allowedRoles.includes(
            role
          )
        ) {
          return (
            <Redirect
              to={
                RouteNames.MANAGEMENT_DASHBOARD
              }
            />
          );
        }

        return <>{children}</>;
      }}
    />
  );
};

const FallbackRoute: React.FC =
  () => {
    const currentUser =
      useInspectionStore(
        (state) =>
          state.currentUser
      );

    const user =
      currentUser ??
      useInspectionStore
        .getState()
        .getCurrentUser();

    return (
      <Redirect
        to={
          user
            ? RouteNames.MANAGEMENT_DASHBOARD
            : RouteNames.LOGIN
        }
      />
    );
  };

export const AppRouter: React.FC =
  () => {
    return (
      <Switch>
        <Route
          exact
          path={RouteNames.LOGIN}
          component={Login}
        />

        <PrivateRoute
          exact
          path={
            RouteNames.MANAGEMENT_DASHBOARD
          }
        >
          <ManagementDashboard />
        </PrivateRoute>

        {/*
          בודקים:
          אדמין מנהל את הבודקים ביחידה שלו.
          מאסטר מנהל לפי היחידה שנבחרה.
        */}
        <RoleRoute
          exact
          path={
            RouteNames.INSPECTORS
          }
          allowedRoles={[
            'admin',
            'master',
          ]}
        >
          <InspectorManagement />
        </RoleRoute>

        {/*
          ניהול משתמשים מערכתיים:
          MASTER בלבד.
        */}
        <RoleRoute
          exact
          path={
            RouteNames.MASTERS_USERS_MANAGEMENT
          }
          allowedRoles={[
            'master',
          ]}
        >
          <MasterUserManagement />
        </RoleRoute>

        <PrivateRoute
          exact
          path={
            RouteNames.NEW_FORM
          }
        >
          <InspectionForm />
        </PrivateRoute>

        <PrivateRoute
          exact
          path={RouteNames.SCAN}
        >
          <DeviceScanner />
        </PrivateRoute>

        <PrivateRoute
          exact
          path={
            RouteNames.INSPECTED_DEVICE_LIST
          }
        >
          <DeviceList />
        </PrivateRoute>

        <PrivateRoute
          exact
          path={
            RouteNames.UNINSPECTED_DEVICE_LIST
          }
        >
          <DeviceList />
        </PrivateRoute>

        <PrivateRoute
          exact
          path={
            RouteNames.DEVICE_DETAILS
          }
        >
          <DeviceDetails />
        </PrivateRoute>

        <PrivateRoute
          exact
          path={
            RouteNames.FORM_DEVICES
          }
        >
          <FormDevices />
        </PrivateRoute>

        {/*
          יצירת/עריכת יחידות ואזורים:
          MASTER בלבד.
        */}
        <RoleRoute
          exact
          path={
            RouteNames.UNIT_AREA_MANAGEMENT
          }
          allowedRoles={[
            'master',
          ]}
        >
          <UnitAreaManagement />
        </RoleRoute>

        {/*
          ניהול מכשירים:
          ADMIN ביחידה שלו,
          MASTER ביחידה הפעילה.
        */}
        <RoleRoute
          exact
          path={
            RouteNames.DEEVICE_MENEGEMENT
          }
          allowedRoles={[
            'admin',
            'master',
          ]}
        >
          <DeviceManagement />
        </RoleRoute>

        {/*
          תאימות לקוד הישן:
          אין צורך לשנות כרגע את כל navigate.push
          בקומפוננטות.
        */}
        <Redirect
          exact
          from="/management"
          to={
            RouteNames.MANAGEMENT_DASHBOARD
          }
        />

        <Redirect
          exact
          from="/management/inspectors"
          to={
            RouteNames.INSPECTORS
          }
        />

        <Redirect
          exact
          from="/management/new-form"
          to={
            RouteNames.NEW_FORM
          }
        />

        <Redirect
          exact
          from={RouteNames.HOME}
          to={
            RouteNames.MANAGEMENT_DASHBOARD
          }
        />

        {/*
          כתובת לא מוכרת:
          משתמש מחובר -> Dashboard
          משתמש לא מחובר -> Login

          כך לא יהיה יותר flash של Login
          בגלל נתיב שגוי.
        */}
        <Route
          component={FallbackRoute}
        />
      </Switch>
    );
  };
