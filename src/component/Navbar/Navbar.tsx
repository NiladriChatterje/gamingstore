import React from 'react'
import styles from './Navbar.module.css'
import { GiHamburgerMenu } from 'react-icons/gi'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStateContext } from '../../StateContext';

const navItems = ['Home', 'Product', 'About'];

const Navbar = () => {
  const [navActive, setNavActive] = React.useState(() => false);
  const { navRef } = useStateContext();

  return (
    <motion.nav
      ref={navRef}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}>
      <span id={styles['heading']}>
        <span>
          XV
        </span>
        Shop
      </span>
      <GiHamburgerMenu
        onClick={() => setNavActive(prev => !prev)}
        id={styles['GiHamburgerMenu']}
        style={{
          cursor: 'pointer',
          zIndex: 10,
          position: 'fixed',
          height: '25px',
          width: '25px',
          right: 10, top: 13.5
        }} />
      <div
        id={navActive ? styles['navitems-active'] : styles['navitems-inactive']}>
        {navItems?.map((item, i) => <Link to={`/${item === "Home" ? '' : item}`} id={styles['text']} key={i}>{item}</Link>)}
      </div>

    </motion.nav>
  )
}

export default Navbar