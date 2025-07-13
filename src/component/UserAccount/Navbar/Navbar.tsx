import React, { useState } from 'react'
import styles from './Navbar.module.css'
import './ClerkStyle.css'
import { GiHamburgerMenu } from 'react-icons/gi'
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useStateContext } from '../../../StateContext';
import { useUserStateContext } from '../UserStateContext';
import { BsFillBagPlusFill } from 'react-icons/bs';
import { FaHome, FaShopify } from "react-icons/fa";
import { MdProductionQuantityLimits } from "react-icons/md";
import { FcAbout } from "react-icons/fc";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { UserUpdateForm } from '../components';


const navItems = [{ Img: FaHome, name: 'Home', link: '' },
{ Img: MdProductionQuantityLimits, name: 'Product', link: 'Product' },
{ Img: FaShopify, name: 'Orders', link: 'Orders' }, { Img: FaShopify, name: 'Profile', link: 'profile-update' },
{ Img: FcAbout, name: 'About', link: 'About' }];

const Navbar = () => {
  const [userLogin, setUserLoginDiv] = useState<boolean>(true);
  const [navActive, setNavActive] = React.useState(() => false);
  const { defaultLoginAdminOrUser, setDefaultLoginAdminOrUser } = useStateContext();
  const { navRef, setSlide } = useUserStateContext();

  return (
    <motion.nav
      ref={navRef}
      id={styles['nav']}
      initial={{ scale: 0.5 }}
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
        {navItems?.map((item, i) => <Link to={`/user/${item.link}`} className={styles['text']} key={i}>
          <item.Img className={styles['nav-list-icons']} />
          {item.name}</Link>)}
      </div>
      <div id={styles['ham-cart-login-container']}>
        <BsFillBagPlusFill
          onClick={() => {
            if (setSlide)
              setSlide(true);
          }}
          id={styles['BsFillBagPlusFill']}
          cursor={'pointer'} />
        <SignedOut>
          <button
            style={{ fontSize: '0.80em' }}
            onClick={() => {
              setUserLoginDiv(prev => !prev);
            }}
          >
            Sign In
          </button>
          <div
            className={userLogin ? styles['user-admin-btn-group-hide'] :
              styles['user-admin-btn-group-show']
            }
            id={styles['user-admin-btn-group']}>
            <SignInButton
              mode='modal'>
              <button
                className={`${styles['login-btn']} ${defaultLoginAdminOrUser === 'admin' ? styles['selected-admin-user'] : ''}`}
                onClick={() => {
                  setUserLoginDiv(true);
                  localStorage.setItem("loginusertype", "admin");
                  setDefaultLoginAdminOrUser?.('admin');
                }}
              >
                Seller
              </button>
            </SignInButton>
            <SignInButton
              mode='modal' >
              <button
                className={`${styles['login-btn']} ${defaultLoginAdminOrUser === 'user' ? styles['selected-admin-user'] : ''}`}
                onClick={() => {
                  setUserLoginDiv(true);
                  localStorage.setItem("loginusertype", "user");
                  setDefaultLoginAdminOrUser?.('user')
                }}
              >
                User
              </button>
            </SignInButton>
          </div>
        </SignedOut>
        <SignedIn>
          {/* <UserUpdateForm /> */}
          <UserButton appearance={{
            elements: [styles['user-loggedIn-btn']]
          }} />
        </SignedIn>
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