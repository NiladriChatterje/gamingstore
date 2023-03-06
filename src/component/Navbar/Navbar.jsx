import React from 'react'
import './Navbar.css'
import { GiHamburgerMenu } from 'react-icons/gi'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const navItems = ['Home', 'Product', 'About'];

const Navbar = () => {
  const [navActive, setNavActive] = React.useState(() => false);


  return (
    <motion.nav
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}>
      <span id={'heading'}>
        <span>
          XV
        </span>
        Shop
      </span>

      <div
        onClick={() => setNavActive(prev => !prev)}
        id={navActive ? 'navitems-active' : 'navitems-inactive'}>
        {window.innerWidth < 1200 && <GiHamburgerMenu
          style={{
            cursor: 'pointer',
            color: 'white',
            zIndex: 10,
            position: 'absolute',
            height: '25px',
            width: '25px',
            right: 10, top: 5
          }} />}
        {navItems?.map((item, i) => <Link to={`/${item === "Home" ? '' : item}`} id='text' key={i}>{item}</Link>)}
      </div>

    </motion.nav>
  )
}

export default Navbar