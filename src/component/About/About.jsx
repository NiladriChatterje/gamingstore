import React from 'react';
import './About.css';
import {motion} from 'framer-motion'
import Xbox from './xbox.png'
import Xbox2 from './xbox2.webp'

const style={
    height:'180px',width:'180px',
    borderRadius:'50%',position:'absolute',
    backgroundImage:'linear-gradient(to right,rgb(120,150,185),rgb(105,148,255))'
  }
const About = () => {

  return (
    <motion.div
        id='about-container'
        initial={{x:-300}}
        animate={{x:0}}>
            <div
              id='about-sec1'>
            <motion.div>
            <h1>
            The Reason why<br />you are Here.
            </h1>
            <p>
                Well, The same reason why we<br />
                evolved. So that you can GAME <br />
                with no risk of breakage.
            </p>
            </motion.div>
            <div>
            <React.Suspense fallback={<div>Loading..</div>}>
            <motion.img
                initial={{x:600}}
                animate={{x:0}}
                src={Xbox} />
            </React.Suspense>
            <motion.div
                initial={{ opacity: 0,transform:'scale(0,0)' }}
                whileInView={{ opacity: 1,transform:'scale(1,1)' }}
                style={{...style,right:'15%',top:130}}/>
            </div>
            </div>
            <motion.div
                id={'about-sec2'}
                initial={{y:200}}
                animate={{y:0}}>

            </motion.div>
            <motion.div
                id={'about-sec3'}
                initial={{y:100}}
                animate={{y:0}}>
                    <motion.img
                        initial={{x:600}}
                        animate={{x:0}}
                        src={Xbox2} alt='' />
                        <motion.div
                        initial={{ opacity: 0,transform:'scale(0,0)' }}
                        whileInView={{ opacity: 1,transform:'scale(1,1)' }}
                        style={{...style,left:'10%',top:130}}/>
                <p>
                <h2>We hate complains</h2><br/>
                That is why, Our Products are Tested before delivery<br />
                We take care of the fact that interruption is often disappointing<br />
                </p>
            
            
            </motion.div> 
            
    </motion.div>
  )
}


export default About