import React from 'react'
import './Navbar.css'
import {GiHamburgerMenu} from 'react-icons/gi'
import { motion } from 'framer-motion';
import {Link} from 'react-router-dom';
import {BsFillBagPlusFill} from 'react-icons/bs'
import OrderList from './OrderList';
import { ProductContext } from '../../App';

const navItems=['Home','Product','Trending','Popular','About'];

const Navbar = () => {
    const [navActive,setNavActive] = React.useState(()=>false)
    const [slide,setSlide] = React.useState(()=>false)
    const {data} = React.useContext(ProductContext);

  return (
    <motion.nav
    initial={{scale:0}}
    animate={{scale:1}}>
        <text id={'heading'}>
            <span>
                XV
            </span>
            Shop  
        </text>
        
        <div
         onClick={()=>setNavActive(prev=>!prev)}
         id={navActive?'navitems-active':'navitems-inactive'}>
            {window.innerWidth<1200 && <GiHamburgerMenu
                style={{cursor:'pointer',
                color:'white',
                zIndex:10,
                position:'absolute',
                height:'25px',
                width:'25px',
                right:10,top:4}} />}
        {navItems?.map((item,i)=><Link to={`/${item==="Home"?'':item}`} id='text' key={i}>{item}</Link>)}
        </div>
        <BsFillBagPlusFill
          onClick={()=>setSlide(prev=>!prev)}
          style={{color:'white',height:20,width:20,cursor:'pointer',
                  zIndex:5,position:'fixed',right:90}} />

          <div
            className= {`slider ${slide?'':'hide-slider'}`} >
              {data?.map((item,i)=><OrderList key={i} image={item.image} price={item.price} />)}
          </div>
    </motion.nav>
  )
}

export default Navbar