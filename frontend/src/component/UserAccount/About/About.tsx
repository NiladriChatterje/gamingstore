import React from 'react';
import styles from './About.module.css';
import { motion, MotionStyle } from 'framer-motion'
import Xbox from './xbox.png'
import Xbox2 from './xbox2.webp'
import { AiFillGithub, AiFillInstagram, AiFillMail } from 'react-icons/ai'
import { MdVerified, MdLocalShipping, MdSupportAgent } from 'react-icons/md'

const style: MotionStyle = {
    height: '180px', width: '180px',
    borderRadius: '50%', position: 'absolute',
    backgroundImage: 'linear-gradient(to right,rgb(120,150,185),rgb(105,148,255))'
}

const featureData = [
    {
        title: 'Quality Assured',
        description: 'Every product undergoes rigorous testing before delivery to ensure peak performance',
        icon: MdVerified
    },
    {
        title: 'Fast Delivery',
        description: 'Swift and reliable shipping to get your gaming gear to you in perfect condition',
        icon: MdLocalShipping
    },
    {
        title: '24/7 Support',
        description: 'Our dedicated team is always ready to help with any questions or concerns',
        icon: MdSupportAgent
    }
]

const About = () => {
    return (
        <motion.div
            id={styles['about-container']}
            initial={{ x: -300 }}
            animate={{ x: 0 }}>

            {/* Hero Section */}
            <div id={styles['about-sec1']}>
                <motion.section
                    initial={{ x: window.innerWidth > 1200 ? -400 : -90 }}
                    whileInView={{ x: 0 }}
                    style={{ flex: 1, minWidth: '0', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: 'clamp(24px, 5vw, 48px)', lineHeight: '1.3', wordWrap: 'break-word', overflowWrap: 'break-word', margin: '0 0 16px 0', fontFamily: 'Blanka, sans-serif' }}>
                        The Reason Why<br />
                        <span style={{ background: 'linear-gradient(to right, rgb(105,148,255), rgb(120,150,185))', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                            You Are Here
                        </span>
                    </h1>
                    <p style={{ fontSize: 'clamp(13px, 2vw, 16px)', lineHeight: '1.6', margin: '0 0 16px 0', wordWrap: 'break-word', overflowWrap: 'break-word', color: 'rgb(80,80,80)' }}>
                        We evolved to bring you the ultimate gaming experience. High-quality gaming gear delivered with precision, ensuring zero compromises on performance.
                    </p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            background: 'rgba(105,148,255,0.1)',
                            border: '1px solid rgb(105,148,255)',
                            fontSize: '13px',
                            color: 'rgb(105,148,255)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                        }}>✓ Trusted by Gamers</div>
                        <div style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            background: 'rgba(105,148,255,0.1)',
                            border: '1px solid rgb(105,148,255)',
                            fontSize: '13px',
                            color: 'rgb(105,148,255)',
                            fontWeight: 500,
                            whiteSpace: 'nowrap'
                        }}>✓ Premium Quality</div>
                    </motion.div>
                </motion.section>
                <div style={{ flex: 1, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '0' }}>
                    <React.Suspense fallback={<div>Loading..</div>}>
                        <motion.img
                            initial={{ x: 600, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            src={Xbox}
                            style={{ maxWidth: '100%', height: 'auto' }} />
                    </React.Suspense>
                    <motion.div
                        initial={{ opacity: 0, transform: 'scale(0,0)' }}
                        whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
                        style={{ ...style, right: '15%', top: 130 }} />
                </div>
            </div>

            {/* Features Section */}
            <motion.section
                id={styles['about-sec2']}
                initial={{ y: 200, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}>
                <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 20px' }}>
                    <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, marginBottom: '12px', color: 'rgb(43,43,43)', margin: '0 0 12px 0', fontFamily: 'Blanka, sans-serif' }}>
                        Why Choose Us
                    </h2>
                    <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: 'rgb(100,100,100)', maxWidth: '500px', margin: '0 auto', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        We're committed to excellence in every aspect of your gaming journey
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? 'repeat(3, 1fr)' : window.innerWidth > 480 ? 'repeat(2, 1fr)' : '1fr', gap: '20px', padding: '0 20px', maxWidth: '1200px', margin: '0 auto' }}>
                    {featureData.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ y: 30, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: idx * 0.15 }}
                                whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(105,148,255,0.15)' }}
                                style={{
                                    padding: '24px',
                                    borderRadius: '12px',
                                    background: 'rgba(105,148,255,0.05)',
                                    border: '1px solid rgba(105,148,255,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-start',
                                    gap: '12px',
                                    height: '100%',
                                    minHeight: '250px',
                                    boxSizing: 'border-box'
                                }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{ delay: idx * 0.15 + 0.2 }}>
                                    <Icon size={40} color='rgb(105,148,255)' />
                                </motion.div>
                                <h3 style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: 600, color: 'rgb(43,43,43)', margin: 0, wordWrap: 'break-word', overflowWrap: 'break-word', fontFamily: 'Blanka, sans-serif' }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: 'rgb(100,100,100)', lineHeight: '1.6', margin: 0, flex: 1, wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.section>

            {/* Quality Commitment Section */}
            <motion.section
                id={styles['about-sec3']}
                initial={{ y: 100, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '40px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                    <motion.img
                        initial={{ x: -50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        src={Xbox2}
                        alt='Quality Gaming Gear'
                        style={{ maxWidth: '100%', height: 'auto' }} />
                    <motion.div
                        initial={{ opacity: 0, transform: 'scale(0,0)' }}
                        whileInView={{ opacity: 1, transform: 'scale(1,1)' }}
                        style={{ ...style, left: '10%', top: 130 }} />
                    <div>
                        <h2 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 600, marginBottom: '16px', color: 'rgb(43,43,43)', wordWrap: 'break-word', overflowWrap: 'break-word', fontFamily: 'Blanka, sans-serif' }}>
                            Our Commitment to Excellence
                        </h2>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}>
                            <p style={{
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                color: 'rgb(80,80,80)',
                                lineHeight: '1.8',
                                marginBottom: '16px',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}>
                                We understand that gaming is more than just a hobby—it's a passion. That's why every product in our inventory is carefully selected and tested before reaching your doorstep.
                            </p>
                            <p style={{
                                fontSize: 'clamp(12px, 2vw, 14px)',
                                color: 'rgb(80,80,80)',
                                lineHeight: '1.8',
                                marginBottom: '16px',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}>
                                Our quality assurance process ensures that you receive only the best gaming gear, free from defects and ready for immediate use.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                                <div style={{
                                    padding: '12px',
                                    borderLeft: '3px solid rgb(105,148,255)',
                                    background: 'rgba(105,148,255,0.05)',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(105,148,255)', wordWrap: 'break-word' }}>100%</div>
                                    <div style={{ fontSize: '12px', color: 'rgb(100,100,100)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>Tested Products</div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    borderLeft: '3px solid rgb(105,148,255)',
                                    background: 'rgba(105,148,255,0.05)',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}>
                                    <div style={{ fontSize: '16px', fontWeight: 600, color: 'rgb(105,148,255)', wordWrap: 'break-word' }}>24/7</div>
                                    <div style={{ fontSize: '12px', color: 'rgb(100,100,100)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>Customer Support</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Footer Section */}
            <motion.footer
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    borderTop: '1px solid rgba(105,148,255,0.1)',
                    paddingTop: '40px',
                    marginTop: '60px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 20px' }}>
                    <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 600, marginBottom: '12px', color: 'rgb(43,43,43)', margin: '0 0 12px 0', wordWrap: 'break-word', fontFamily: 'Blanka, sans-serif' }}>
                        Connect With Us
                    </h3>
                    <p style={{ fontSize: 'clamp(12px, 2vw, 13px)', color: 'rgb(100,100,100)', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                        Follow our journey and stay updated with the latest gaming gear
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', padding: '0 20px' }}>
                    <motion.div
                        whileHover={{ scale: 1.1, color: 'rgb(105,148,255)' }}
                        whileTap={{ scale: 0.95 }}>
                        <AiFillInstagram
                            onClick={() => window.open('https://www.instagram.com/clerk_maxw/?hl=en', '_blank')}
                            style={{
                                color: 'rgb(120,120,120)',
                                cursor: 'pointer',
                                height: '40px',
                                width: '40px',
                                transition: 'all 0.3s ease'
                            }} />
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1, color: 'rgb(105,148,255)' }}
                        whileTap={{ scale: 0.95 }}>
                        <AiFillGithub
                            onClick={() => window.open('https://github.com/NiladriChatterje', '_blank')}
                            style={{
                                color: 'rgb(120,120,120)',
                                cursor: 'pointer',
                                height: '40px',
                                width: '40px',
                                transition: 'all 0.3s ease'
                            }} />
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.1, color: 'rgb(105,148,255)' }}
                        whileTap={{ scale: 0.95 }}>
                        <AiFillMail
                            onClick={() => window.open('https://mail.google.com/mail/u/0/#inbox?compose=new', '_blank')}
                            style={{
                                color: 'rgb(120,120,120)',
                                cursor: 'pointer',
                                height: '40px',
                                width: '40px',
                                transition: 'all 0.3s ease'
                            }} />
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '32px',
                        paddingTop: '24px',
                        paddingBottom: '20px',
                        paddingLeft: '20px',
                        paddingRight: '20px',
                        borderTop: '1px solid rgba(105,148,255,0.1)',
                        fontSize: '12px',
                        color: 'rgb(150,150,150)',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}>
                    © 2025 Game Store. All rights reserved. | Crafted with precision for gamers.
                </motion.div>
            </motion.footer>
        </motion.div>
    )
}

export default About