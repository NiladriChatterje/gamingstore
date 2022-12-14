import React from 'react'
import './Navbar.css'
import {GiHamburgerMenu} from 'react-icons/gi'
import { motion } from 'framer-motion';
import {Link} from 'react-router-dom';
import {BsFillBagPlusFill} from 'react-icons/bs'
import {AiOutlineClose} from 'react-icons/ai';
import OrderList from './OrderList';
import { ProductContext } from '../../App';

const navItems=['Home','Product','Trending','Popular','About'];

const Navbar = () => {
    const [navActive,setNavActive] = React.useState(()=>false);
    const [slide,setSlide] = React.useState(()=>false);
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
          onClick={()=>setSlide(true)}
          style={{color:'white',height:20,width:20,cursor:'pointer',
                position:'fixed',right:90}} />

          <div
            className= {`slider ${slide?'':'hide-slider'}`} >
               <AiOutlineClose
                        onClick={()=>setSlide(false)}
                        style={{position:'absolute',
                        right:8,top:5,color:'white',
                        fontSize:25,cursor:'pointer',
                        zIndex:10}} />
              {data?.map((item,i)=><OrderList key={i} index={i} image={item.image} price={item.price} />)}
              <motion.button
                onClick={()=>{
                  
                }}
                initial={{y:60}}
                animate={{y:0}}
                id={'payment'}>
                  Place ORDER
              </motion.button>
          </div>
    </motion.nav>
  )
}

export default Navbar