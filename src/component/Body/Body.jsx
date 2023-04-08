import React from 'react'
import './Body.css'
import Joystick from './JoyStick.webp'
import { motion } from 'framer-motion'
import { IoIosCloseCircle } from 'react-icons/io'
import upcomingData from './upcomingData'
import UpcomingDataMap from './UpcomingDataMap'


const style = {
  height: '180px', width: '180px',
  borderRadius: '50%', position: 'absolute',
  backgroundImage: 'linear-gradient(to right,rgb(120,150,185),rgb(105,148,255))'
}
const Body = () => {
  const secondContRef = React.useRef(null);
  const joyRef = React.useRef(null);
  const [val, setVal] = React.useState(0);


  return (
    <motion.div id={'container'}
      initial={{ x: 150 }}
      animate={{ x: 0 }}>
      <motion.div id='first-container'
        initial={{ opacity: 0, transform: 'scale(0,0)' }}
        whileInView={{ opacity: 1, transform: 'scale(1,1)' }}>
        <div>
          <h1>
            XBOX Controller
          </h1>
          <p>
            This is a hyper Ergonomic XBOX <br />
            Controller concept Makes Gaming More <br />
            Comfortable
          </p>
          <button
            onClick={() => { setVal(600); joyRef.current.style.transform = 'scale(0.7)' }}>
            EXPLORE
          </button>
        </div>
      </motion.div>

      <motion.div id='second-container' ref={secondContRef}>
        <motion.div
          initial={{ opacity: 0, transform: 'scale(0,0)' }}
          whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
          viewport={{ root: secondContRef }}
          style={{ ...style, left: 120, top: 130 }} />

        <motion.div
          initial={{ opacity: 0, transform: 'scale(0,0)' }}
          whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
          style={{ ...style, right: 120, bottom: 140 }} />
        <img src={Joystick} alt='' ref={joyRef}
          style={{objectFit:'contain',
            position: 'absolute', zIndex: 1, width: '75%',
            filter: 'drop-shadow(4px 10px 20px)', transition: 'all',
            transitionDuration: '300ms'
          }} />
      </motion.div>

      <motion.div
        id='modal'
        style={{
          width: '100vw', zIndex: 5,
          opacity: 0.97,
          position: 'fixed', bottom: 0,
          backgroundColor: 'white',
          height: '0px'
        }}
        initial={{ height: 0 }}
        animate={{ height: val }}
      >
        <span>
          Upcoming Products:
        </span>
        {upcomingData?.map(item => <UpcomingDataMap key={item.id} id={item.id} image={item.image} price={item.price} name={item.name} desc={item.desc} />)}
        <IoIosCloseCircle
          onClick={() => { setVal(0); joyRef.current.style.transform = 'scale(1)' }}
          style={{
            position: 'absolute', top: 20, right: 30,
            transform: 'scale(2)', cursor: 'pointer'
          }} />
      </motion.div>
    </motion.div>
  )
}

export default Body