import React from 'react'
import styles from './Navbar.module.css'
import { GiHamburgerMenu } from 'react-icons/gi'
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useStateContext } from '../../StateContext';
import { BsFillBagPlusFill } from 'react-icons/bs';
import { FaHome } from "react-icons/fa";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FcAbout } from "react-icons/fc";



const navItems = [{ Img: FaHome, name: 'Home' }, { Img: MdProductionQuantityLimits, name: 'Product' },
{ Img: FcAbout, name: 'About' }];

const Navbar = () => {
  const [navActive, setNavActive] = React.useState(() => false);
  const { navRef, userSession, setSlide } = useStateContext();
  const navigate = useNavigate();

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
      <div
        className={styles['nav-routes']}
        id={navActive ? styles['navitems-active'] : styles['navitems-inactive']}>
        {navItems?.map((item, i) => <Link to={`/${item.name === "Home" ? '' : item.name}`} className={styles['text']} key={i}>
          <item.Img className={styles['nav-list-icons']} />
          {item.name}</Link>)}
      </div>
      <div id={styles['ham-cart-login-container']}>
        <BsFillBagPlusFill
          onClick={() => {
            if (setSlide)
              setSlide(true)
          }}
          id={styles['BsFillBagPlusFill']}
          cursor={'pointer'} />
        <button
          onClick={() => {
            if (!userSession)
              navigate('/login');
            else {
              //enable logout modal logic
            }
          }}
        >
          <span>Login</span>
        </button>
        <GiHamburgerMenu
          onClick={() => setNavActive(prev => !prev)}
          id={styles['GiHamburgerMenu']}
          style={{
            cursor: 'pointer',
            zIndex: 10,
            height: '25px',
            width: '25px',
          }} />
      </div>
    </motion.nav>
  )
}

export default Navbar