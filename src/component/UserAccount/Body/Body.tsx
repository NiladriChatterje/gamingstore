import React from 'react'
import styles from './Body.module.css'
import Controller from './controller.svg'
import { motion, MotionStyle } from 'framer-motion'
import { IoIosCloseCircle } from 'react-icons/io'
import upcomingData from './upcomingData.ts'
import UpcomingDataMap from './UpcomingDataMap.tsx'

const style1: MotionStyle = {
  height: '250px', width: '250px',
  borderTopLeftRadius: '50%',
  borderTopRightRadius: '17%',
  borderBottomLeftRadius: '10%',
  borderBottomRightRadius: '60%',
  filter: 'blur(50px)',
  opacity: 0.4,
  boxShadow: '-10px -55px 400px -5px rgb(56, 106, 231)',
  position: 'absolute',
  backgroundImage: 'linear-gradient(to right,rgb(25, 25, 37),rgb(24, 25, 40))'
}
const style2: MotionStyle = {
  height: '240px', width: '260px',
  borderTopLeftRadius: '50%',
  borderTopRightRadius: '27%',
  borderBottomLeftRadius: '40%',
  borderBottomRightRadius: '60%',
  filter: 'blur(60px)',
  opacity: 0.3,
  boxShadow: '80px 65px 75px -15px rgb(61, 80, 152)',
  position: 'absolute',
  backgroundImage: 'linear-gradient(to right,rgb(56, 68, 146),rgba(19, 16, 74, 0.6))'
}

const Body = () => {
  const secondContRef = React.useRef<HTMLDivElement>(null);
  const joyRef = React.useRef<HTMLImageElement>(null);
  const [val, setVal] = React.useState<string>('none');
  const [toggle, setToggle] = React.useState<boolean>(false);


  return (
    <>
      <motion.div id={styles['container']}
        initial={{ x: 150 }}
        animate={{ x: 0 }}>
        <div id={styles['first-container']}>
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
              onClick={() => {
                setVal('70dvh');
                setToggle(true);
                if (joyRef.current)
                  joyRef.current.style.transform = 'scale(0.7)'
              }}>
              EXPLORE
            </button>
          </div>
        </div>

        <motion.div id={styles['second-container']} ref={secondContRef}>
          <motion.div
            initial={{ opacity: 0, transform: 'scale(0,0)' }}
            whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
            viewport={{ root: secondContRef }}
            style={{ ...style1, left: 160, top: 250 }} />

          <motion.div
            initial={{ opacity: 0, transform: 'scale(0,0)' }}
            whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
            style={{ ...style2, right: 160, bottom: 260 }} />

          <img src={Controller} alt='' ref={joyRef}
            style={{
              objectFit: 'contain',
              position: 'absolute', zIndex: 1, width: '75%',
              filter: 'drop-shadow(#3c3c3c 5px 8px 8px)',
            }} />
        </motion.div>
      </motion.div>
      <motion.div
        id={styles['modal']}
        style={{
          width: '100vw', zIndex: 5,
          display: 'flex', flexDirection: 'column',
          backgroundColor: 'white',
        }}
        initial={{ height: '0svh' }}
        animate={{ height: val, opacity: toggle ? 1 : 0 }}
      >
        <span>
          Upcoming Products:
        </span>
        <section
          style={{
            display: 'flex',
            margin: 25,
            overflowX: 'clip',
            overflowY: 'auto',
            flexWrap: 'wrap', justifyContent: 'center',

          }}
        >
          {upcomingData?.map(item => <UpcomingDataMap key={item._id} _id={item._id} image={(item.imagesBase64 && item.imagesBase64[0]?.base64) ?? ''} price={item.price.pdtPrice} name={item.productName} desc={item.productDescription} />)}
          <IoIosCloseCircle
            onClick={() => {
              setToggle(false);
              setVal('0svh');
              if (joyRef.current)
                joyRef.current.style.transform = 'scale(1)'
            }}
            color={'rgb(40,48,102)'}
            style={{
              position: 'absolute', top: 20, right: 45,
              transform: 'scale(2)', cursor: 'pointer'
            }} />
        </section>
      </motion.div>
    </>
  )
}

export default Body