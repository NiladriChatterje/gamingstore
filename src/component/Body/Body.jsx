import React from 'react'
import './Body.css'
import Joystick from './joystick.png'
import {motion} from 'framer-motion'


const style={
  height:'180px',width:'180px',
  borderRadius:'50%',position:'absolute',
  backgroundImage:'linear-gradient(to right,rgb(120,150,185),rgb(105,148,255))'
}
const Body = () => {
  const secondContRef = React.useRef(null);
  return (
    <div id={'container'}>
      <motion.div id='first-container' 
       initial={{ opacity: 0,transform:'scale(0,0)' }}
       whileInView={{ opacity: 1,transform:'scale(1,1)' }}>
        <div>
        <h1>
          XBOX Controller
        </h1>
        <p>
          This is a hyper Ergonomic XBOX <br />
          Controller concept Makes Gaming More <br />
          Comfortable
        </p>   
        <button>
          EXPLORE
        </button>      
        </div>

      </motion.div>
      <motion.div id='second-container' ref={secondContRef}>
              <motion.div
                initial={{ opacity: 0,transform:'scale(0,0)' }}
                whileInView={{ opacity: 1,transform:'scale(1,1)' }}
                viewport={{root:secondContRef}}
                style={{...style,left:120,top:130}}/>

              <motion.div
              initial={{ opacity: 0,transform:'scale(0,0)' }}
              whileInView={{ opacity: 1,transform:'scale(1,1)' }}
              style={{...style,right:120,bottom:140}}/>
              <img src={Joystick} alt=''
                style={{position:'absolute',zIndex:1,filter:'drop-shadow(4px 10px 20px)'}} />
      </motion.div>
      
    </div>
  )
}

export default Body