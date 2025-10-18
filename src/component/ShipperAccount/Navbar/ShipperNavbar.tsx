import React, { useState } from 'react';
import styles from './ShipperNavbar.module.css';
import { GiHamburgerMenu } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import { useStateContext } from '../../../StateContext';
import { FaHome, FaShippingFast } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { FcAbout } from "react-icons/fc";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

const navItems = [
    { Img: FaHome, name: 'Home', link: '' },
    { Img: MdDashboard, name: 'Dashboard', link: 'dashboard' },
    { Img: FaShippingFast, name: 'Shipments', link: 'shipments' },
    { Img: FcAbout, name: 'About', link: 'about' }
];

const ShipperNavbar = () => {
    const [userLogin, setUserLoginDiv] = useState<boolean>(true);
    const [navActive, setNavActive] = React.useState(() => false);
    const { defaultLoginAdminOrUser, setDefaultLoginAdminOrUser } = useStateContext();

    return (
        <nav id={styles['nav']}>
            <span id={styles['heading']}>
                <span>XV</span>
                Ship
            </span>
            <div
                className={styles['nav-routes']}
                id={navActive ? styles['navitems-active'] : styles['navitems-inactive']}>
                {navItems?.map((item, i) => (
                    <Link to={`/shipper/${item.link}`} className={styles['text']} key={i}>
                        <item.Img className={styles['nav-list-icons']} />
                        {item.name}
                    </Link>
                ))}
            </div>
            <div id={styles['ham-cart-login-container']}>
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
                        <SignInButton mode='modal'>
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
                        <SignInButton mode='modal'>
                            <button
                                className={`${styles['login-btn']} ${defaultLoginAdminOrUser === 'user' ? styles['selected-admin-user'] : ''}`}
                                onClick={() => {
                                    setUserLoginDiv(true);
                                    localStorage.setItem("loginusertype", "user");
                                    setDefaultLoginAdminOrUser?.('user');
                                }}
                            >
                                User
                            </button>
                        </SignInButton>
                        <SignInButton mode='modal'>
                            <button
                                className={`${styles['login-btn']} ${defaultLoginAdminOrUser === 'shipper' ? styles['selected-admin-user'] : ''}`}
                                onClick={() => {
                                    setUserLoginDiv(true);
                                    localStorage.setItem("loginusertype", "shipper");
                                    setDefaultLoginAdminOrUser?.('shipper');
                                }}
                            >
                                Shipper
                            </button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
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
        </nav>
    );
};

export default ShipperNavbar;