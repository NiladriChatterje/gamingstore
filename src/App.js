import './App.css';
import Navbar from './component/Navbar/Navbar';
import Body from './component/Body/Body';
import About from './component/About/About';
import Products from './component/Products/Products';
import {Routes,Route} from 'react-router-dom'


function App() {


  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path={'/'} element={<Body />} />
        <Route path={'/About'} element={<About />} />
        <Route path={'/Product'} element={<Products />} />
        
      </Routes>
      
    </div>
  );
}

export default App;
