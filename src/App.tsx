import './App.css';
import { useEffect, useState } from 'react';
import { UserAccount, AdminAccount } from './component';
import PreLoader from './PreLoader.tsx';
import { Toaster } from 'react-hot-toast';
import { useStateContext } from './StateContext';
import { useUser } from '@clerk/clerk-react';

function App() {
  const [loading, setLoading] = useState(() => true);
  useEffect(() => { setTimeout(() => setLoading(false), 900) }, []);
  const { defaultLoginAdminOrUser } = useStateContext();
  const { user } = useUser();


  return (
    <div className="App">
      <Toaster containerStyle={{ fontSize: '0.65em', fontWeight: 900 }} />
      {loading ? <PreLoader /> : <>
        {(defaultLoginAdminOrUser === 'admin' && user !== null) ?
          <AdminAccount /> : (
            <UserAccount />)}
      </>}
    </div>
  );
}

export default App;
