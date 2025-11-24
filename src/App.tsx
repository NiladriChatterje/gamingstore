import './App.css';
import { Suspense, useEffect, useState } from 'react';
import { UserRootContext, AdminRootContext, ShipperRootContext } from './component';
import PreLoader from './PreLoader.tsx';
import { Toaster } from 'react-hot-toast';
import { useStateContext } from './StateContext.tsx';
import { useUser } from '@clerk/clerk-react';

// Role-based component mapping for easy extensibility
const roleComponentMap: Record<string, React.ComponentType> = {
  admin: AdminRootContext,
  shipper: ShipperRootContext,
  user: UserRootContext,
};

function App() {
  const [loading, setLoading] = useState(() => true);
  useEffect(() => { setTimeout(() => setLoading(false), 100) }, []);
  const { defaultLoginAdminOrUser } = useStateContext();
  const { user } = useUser();

  // Debug logging
  useEffect(() => {
    console.log('App.tsx - Rendering with:');
    console.log('  - defaultLoginAdminOrUser:', defaultLoginAdminOrUser);
    console.log('  - user:', user);
    console.log('  - localStorage loginusertype:', localStorage.getItem('loginusertype'));
  }, [defaultLoginAdminOrUser, user]);

  // Get the appropriate component based on role, default to UserRootContext
  const getRoleComponent = () => {
    if (user !== null && defaultLoginAdminOrUser && defaultLoginAdminOrUser in roleComponentMap) {
      console.log('App.tsx - Selecting component for role:', defaultLoginAdminOrUser);
      return roleComponentMap[defaultLoginAdminOrUser];
    }
    console.log('App.tsx - No user or invalid role, defaulting to UserRootContext');
    // Default to UserRootContext if no user, no role selected, or invalid role
    return UserRootContext;
  };

  const RoleComponent = getRoleComponent();

  return (
    <div className="App">
      <Toaster
        containerStyle={{ fontSize: '0.65em', fontWeight: 900 }} />
      <Suspense fallback={<PreLoader />}>
        {loading ? <PreLoader /> : <RoleComponent />}
      </Suspense>
    </div>
  );
}

export default App;
