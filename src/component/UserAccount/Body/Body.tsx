import React from 'react'
import styles from './Body.module.css'
import Controller3D from './Controller3D'
import { IoIosCloseCircle } from 'react-icons/io'
import { AiOutlineShoppingCart, AiOutlineTruck, AiOutlineSwap, AiOutlineTeam } from 'react-icons/ai'
import upcomingData from './upcomingData.ts'
import UpcomingDataMap from './UpcomingDataMap.tsx'

const Body = () => {
  const joyRef = React.useRef<HTMLImageElement>(null);
  const [val, setVal] = React.useState<string>('none');
  const [toggle, setToggle] = React.useState<boolean>(false);

  return (
    <>
      {/* Hero Section */}
      <div id={styles['container']}>
        <div id={styles['hero-section']}>
          <div id={styles['hero-content']}>
            <h1>Welcome to Your Marketplace</h1>
            <p>Discover premium quality products across all categories. From electronics to gaming gear, find everything you need in one place.</p>
            <button
              onClick={() => {
                setVal('70dvh');
                setToggle(true);
                if (joyRef.current)
                  joyRef.current.style.transform = 'scale(0.7)'
              }}
              id={styles['cta-button']}>
              Browse Products
            </button>
          </div>
          <div id={styles['hero-image']}>
            <Controller3D />
          </div>
        </div>

        {/* Features Section */}
        <div id={styles['features-section']}>
          <h2>Why Choose Us</h2>
          <div id={styles['features-grid']}>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>
                <AiOutlineShoppingCart size={32} />
              </div>
              <h3>Wide Selection</h3>
              <p>Thousands of products across multiple categories to meet all your needs.</p>
            </div>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>
                <AiOutlineTruck size={32} />
              </div>
              <h3>Fast Shipping</h3>
              <p>Quick and reliable delivery to your doorstep within 3-5 business days.</p>
            </div>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>
                <AiOutlineSwap size={32} />
              </div>
              <h3>Easy Returns</h3>
              <p>30-day return policy with hassle-free exchanges and refunds.</p>
            </div>
            <div className={styles['feature-card']}>
              <div className={styles['feature-icon']}>
                <AiOutlineTeam size={32} />
              </div>
              <h3>24/7 Support</h3>
              <p>Dedicated customer service team ready to help you anytime.</p>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div id={styles['categories-section']}>
          <h2>Shop by Category</h2>
          <div id={styles['categories-grid']}>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Electronics</div>
              <p>Latest gadgets and devices</p>
            </div>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Gaming</div>
              <p>Console games and accessories</p>
            </div>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Home & Garden</div>
              <p>Everything for your home</p>
            </div>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Fashion</div>
              <p>Clothing and accessories</p>
            </div>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Sports</div>
              <p>Athletic gear and equipment</p>
            </div>
            <div className={styles['category-card']}>
              <div className={styles['category-header']}>Books & Media</div>
              <p>Books, movies, and music</p>
            </div>
          </div>
        </div>

        {/* Featured Products Section */}
        <div id={styles['featured-section']}>
          <h2>Featured Products</h2>
          <p className={styles['section-description']}>Handpicked items for you</p>
          <button
            onClick={() => {
              setVal('70dvh');
              setToggle(true);
            }}
            id={styles['featured-btn']}>
            View All Products
          </button>
        </div>

        {/* Info Section */}
        <div id={styles['info-section']}>
          <div className={styles['info-card']}>
            <h3>Quality Guarantee</h3>
            <p>All products are sourced from trusted suppliers and tested for quality before delivery.</p>
          </div>
          <div className={styles['info-card']}>
            <h3>Secure Shopping</h3>
            <p>Your transactions are protected with industry-standard encryption and security measures.</p>
          </div>
          <div className={styles['info-card']}>
            <h3>Best Prices</h3>
            <p>We offer competitive pricing with regular promotions and exclusive deals for members.</p>
          </div>
        </div>
      </div>

      {/* Modal for Products */}
      <div
        id={styles['modal']}
        style={{
          height: val,
          opacity: toggle ? 1 : 0,
          display: toggle ? 'flex' : 'none',
          flexDirection: 'column',
          width: '100vw',
          zIndex: 5,
        }}>
        <div id={styles['modal-header']}>
          <span>Upcoming Products</span>
          <IoIosCloseCircle
            size={28}
            onClick={() => {
              setToggle(false);
              setVal('0svh');
              if (joyRef.current)
                joyRef.current.style.transform = 'scale(1)'
            }}
            style={{ cursor: 'pointer' }}
          />
        </div>
        <section id={styles['modal-content']}>
          {upcomingData?.map(item => (
            <UpcomingDataMap
              key={item._id}
              _id={item._id}
              image={(item.imagesBase64 && item.imagesBase64[0]?.base64) ?? ''}
              price={item.price.pdtPrice}
              name={item.productName}
              desc={item.productDescription}
            />
          ))}
        </section>
      </div>
    </>
  )
}

export default Body