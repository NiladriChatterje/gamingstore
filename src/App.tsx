import './App.css';
import { useEffect, useState } from 'react';
import { UserAccount, AdminAccountRoot } from './component';
import PreLoader from './PreLoader.tsx';
import { Toaster } from 'react-hot-toast';
import { useStateContext } from './StateContext.tsx';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';



function App() {
  const [loading, setLoading] = useState(() => true);
  useEffect(() => { setTimeout(() => setLoading(false), 900) }, []);
  const { defaultLoginAdminOrUser } = useStateContext();
  const { user, isSignedIn } = useUser();

  const navigate = useNavigate();

  useEffect(() => {
    if (isSignedIn) {
      if (defaultLoginAdminOrUser === 'user')
        navigate('/', { replace: true })
      else
        navigate('/admin', { replace: true })
    }
    else
      navigate('/user', { replace: true })
  }, [isSignedIn])

  return (
    <div className="App">
      <Toaster containerStyle={{ fontSize: '0.65em', fontWeight: 900 }} />
      {loading ? <PreLoader /> : <>
        {(defaultLoginAdminOrUser === 'admin' && user !== null) ?
          <AdminAccountRoot /> : (
            <UserAccount />)}
      </>}
    </div>
  );
}

export default App;
