import React from 'react';
import styles from './About.module.css';
import { motion, MotionStyle } from 'framer-motion'
import Xbox from './xbox.png'
import Xbox2 from './xbox2.webp'
import { AiFillGithub, AiFillInstagram, AiFillMail } from 'react-icons/ai'


const style: MotionStyle = {
    height: '180px', width: '180px',
    borderRadius: '50%', position: 'absolute',
    backgroundImage: 'linear-gradient(to right,rgb(120,150,185),rgb(105,148,255))'
}
const About = () => {


    return (
        <motion.div
            id={styles['about-container']}
            initial={{ x: -300 }}
            animate={{ x: 0 }}>
            <div
                id={styles['about-sec1']}>
                <motion.section
                    initial={{ x: window.innerWidth > 1200 ? -400 : -90 }}
                    whileInView={{ x: 0 }}>
                    <h1>
                        The Reason why<br />you are Here.
                    </h1>
                    <p>
                        Well, The same reason why we<br />
                        evolved. So that you can GAME <br />
                        with no risk of breakage.
                    </p>
                </motion.section>
                <div>
                    <React.Suspense fallback={<div>Loading..</div>}>
                        <motion.img
                            initial={{ x: 600 }}
                            animate={{ x: 0 }}
                            src={Xbox} />
                    </React.Suspense>
                    <motion.div
                        initial={{ opacity: 0, transform: 'scale(0,0)' }}
                        whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
                        style={{ ...style, right: '15%', top: 130 }} />
                </div>
            </div>
            <motion.section
                id={styles['about-sec2']}
                initial={{ y: 200 }}
                whileInView={{ y: 0 }}>

            </motion.section>
            <motion.section
                id={styles['about-sec3']}
                initial={{ y: 100 }}
                whileInView={{ y: 0 }}>
                <motion.img
                    initial={{ x: -50 }}
                    whileInView={{ x: 0 }}
                    src={Xbox2} alt='' />
                <motion.div
                    initial={{ opacity: 0, transform: 'scale(0,0)' }}
                    whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
                    style={{ ...style, left: '10%', top: 130 }} />
                <motion.p
                    initial={{ x: 40 }}
                    whileInView={{ x: 0 }}>
                    <h1>We hate complains</h1><br />
                    That is why, Our Products are Tested before delivery<br />
                    We take care of the fact that interruption is often disappointing<br />
                </motion.p>


            </motion.section>
            <motion.footer
                initial={{ y: 50 }}
                whileInView={{ y: 0 }}
            >
                <AiFillInstagram
                    onClick={() => window.open('https://www.instagram.com/clerk_maxw/?hl=en', '_blank')}
                    style={{ color: 'white', cursor: 'pointer', height: '45px', width: '45px' }} />

                <AiFillGithub
                    onClick={() => window.open('https://github.com/NiladriChatterje', '_blank')}
                    style={{ color: 'white', cursor: 'pointer', height: '45px', width: '45px' }} />

                <AiFillMail
                    onClick={() => window.open('https://mail.google.com/mail/u/0/#inbox?compose=new', '_blank')}
                    style={{ color: 'white', cursor: 'pointer', height: '45px', width: '45px' }} />

            </motion.footer>
        </motion.div>
    )
}


export default About