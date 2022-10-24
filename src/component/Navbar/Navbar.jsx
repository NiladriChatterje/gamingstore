import React from 'react'
import './Navbar.css'
import {GiHamburgerMenu} from 'react-icons/gi'

const navItems=['Product','Trending','Popular','About'];

const Navbar = () => {
    const [navActive,setNavActive] = React.useState(()=>false)
  return (
    <nav>
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
                height:'20px',
                width:'20px',
                right:10,top:10}} />}
        {navItems?.map((item,i)=><text id='text' key={i}>{item}</text>)}
        </div>
    </nav>
  )
}

export default Navbar