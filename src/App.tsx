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

  // Get the appropriate component based on role, default to UserRootContext
  const getRoleComponent = () => {
    if (user !== null && defaultLoginAdminOrUser && defaultLoginAdminOrUser in roleComponentMap) {
      return roleComponentMap[defaultLoginAdminOrUser];
    }
    // Default to UserRootContext if no user or invalid role
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
