'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { ShieldCheck, Zap, Lock, MapPin, Heart, ShoppingBag, Clock, GlassWater, Construction, ArrowDown } from 'lucide-react';

const TOTAL_FRAMES = 239;

export default function LandingPage() {
  const [activeThumb, setActiveThumb] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryMsg, setDeliveryMsg] = useState('Available at 25,000+ Pincodes');
  const [isError, setIsError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);

  // Sequence Animation Refs
  const sequenceContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sequenceContainerRef,
    offset: ["start start", "end end"]
  });

  // Smooth progress for the animation
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Calculate current frame
  const frameIndex = useTransform(smoothProgress, [0, 1], [1, TOTAL_FRAMES]);
  
  // Advanced Text & Feature Transforms
  // Intro Text (Whole Watch)
    const introOpacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const introScale = useTransform(smoothProgress, [0, 0.15], [1, 0.8]);
    const introBlur = useTransform(smoothProgress, [0, 0.12], ["blur(0px)", "blur(20px)"]);
  
    // Feature 1: Top Left (Sapphire)
    const feat1Opacity = useTransform(smoothProgress, [0.18, 0.22, 0.35, 0.4], [0, 1, 1, 0]);
    const feat1X = useTransform(smoothProgress, [0.18, 0.22, 0.35, 0.4], [-30, 0, 0, -30]);
  
    // Feature 2: Bottom Right (Movement)
    const feat2Opacity = useTransform(smoothProgress, [0.42, 0.46, 0.6, 0.65], [0, 1, 1, 0]);
    const feat2X = useTransform(smoothProgress, [0.42, 0.46, 0.6, 0.65], [30, 0, 0, 30]);
  
    // Feature 3: Bottom Left (Material)
    const feat3Opacity = useTransform(smoothProgress, [0.68, 0.72, 0.85, 0.9], [0, 1, 1, 0]);
    const feat3Y = useTransform(smoothProgress, [0.68, 0.72, 0.85, 0.9], [30, 0, 0, 30]);

    // Final Stage
    const finalOpacity = useTransform(smoothProgress, [0.92, 0.96], [0, 1]);
    const finalScale = useTransform(smoothProgress, [0.92, 0.96], [0.9, 1]);

  // Dynamic Offset removed — watch stays centered throughout entire scroll
  // const xOffset = useTransform(smoothProgress, [0, 0.45], [-0.22, 0]);

  const images = [
    '/case_view.png',
    '/hero.png'
  ];

  // Image preloading logic
  const preloadedImages = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let loadedCount = 0;
    const loadImages = () => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameStr = i.toString().padStart(3, '0');
        img.src = `/images/herosection/ezgif-frame-${frameStr}.png`;
        img.onload = () => {
          loadedCount++;
          setImagesLoaded(loadedCount);
          if (loadedCount === TOTAL_FRAMES) {
            setIsAllLoaded(true);
          }
        };
        preloadedImages.current[i - 1] = img;
      }
    };

    loadImages();
  }, []);

  // Canvas drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

      const render = (index: number) => {
      const imgIndex = Math.floor(index) - 1;
      const img = preloadedImages.current[Math.max(0, Math.min(imgIndex, TOTAL_FRAMES - 1))];
      
      if (img && img.complete) {
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        const isMobile = window.innerWidth <= 768;
        const canvasWidth = canvas.width / (window.devicePixelRatio || 1);
        const canvasHeight = canvas.height / (window.devicePixelRatio || 1);
        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // On mobile: leave room for bottom text strip (~160px)
        // On desktop: standard scale with slight upward nudge
        const textStripHeight = isMobile ? 160 : 0;
        const availableHeight = canvasHeight - textStripHeight;
        const scaleFactor = isMobile ? 0.88 : 0.82;
        
        const ratio = Math.min(canvasWidth / imgWidth, availableHeight / imgHeight) * scaleFactor;
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        
        // Center horizontally; on mobile anchor to usable area above text strip
        const x = (canvasWidth - newWidth) / 2;
        const y = isMobile
          ? (availableHeight - newHeight) / 2          // centered in upper area
          : (canvasHeight - newHeight) / 2 - (newHeight * 0.03); // desktop: slight upward nudge

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, x, y, newWidth, newHeight);
      }
    };

    // Initial render and scroll listener
    const unsubscribe = frameIndex.onChange(v => render(v));
    
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.scale(dpr, dpr);
      render(frameIndex.get());
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [isAllLoaded]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePincodeCheck = () => {
    if (pincode.length === 6 && !isNaN(Number(pincode))) {
      setDeliveryMsg(`Express delivery available for ${pincode}`);
      setIsError(false);
    } else {
      setDeliveryMsg('Please enter a valid 6-digit pincode');
      setIsError(true);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="black-theme-wrapper">
      <div className="grain-overlay-global" />
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ 
          boxShadow: isScrolled ? '0 10px 30px rgba(0,0,0,0.5)' : 'none',
          background: isScrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="container container-header">
          <div className="logo">
            <a href="#">VERSACE</a>
          </div>
          <motion.nav 
            className="nav-desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <ul>
              <li><a href="#about">Philosophy</a></li>
              <li><a href="#quick-view">Exclusive Access</a></li>
              <li><a href="#specs">Blueprint</a></li>
              <li><a href="#heritage">Legacy</a></li>
            </ul>
          </motion.nav>
          <div className="header-actions">
            <button className="btn-icon"><Heart size={20} /></button>
            <button className="btn-icon"><ShoppingBag size={20} /></button>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Scroll Sequence Hero Section */}
        <section ref={sequenceContainerRef} className="sequence-hero-section">
          <div className="sticky-canvas-wrapper">
            {/* Loading Overlay */}
            {!isAllLoaded && (
              <div className="loader-overlay">
                <div className="loader-container">
                  <div className="loader-rings">
                    <div className="ring" />
                    <div className="ring" />
                    <div className="ring" />
                  </div>
                  <motion.div 
                    className="loader-bar" 
                  >
                    <motion.div 
                      className="loader-progress" 
                      initial={{ width: 0 }}
                      animate={{ width: `${(imagesLoaded / TOTAL_FRAMES) * 100}%` }}
                    />
                  </motion.div>
                  <span className="loader-text">ENGINEERING PERFECTION... {Math.round((imagesLoaded / TOTAL_FRAMES) * 100)}%</span>
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="sequence-canvas" />
            
            {/* Immersive Overlays */}
            <div className="vignette-overlay" />
            <div className="grain-overlay" />

            {/* Intro Phase */}
            <motion.div 
              style={{ opacity: introOpacity, scale: introScale, filter: introBlur }}
              className="sequence-overlay-text intro-phase"
            >
              <div className="reveal-box">
                <motion.span 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="s-tag"
                >
                  VERSACE HOROLOGERIE
                </motion.span>
              </div>
              <h1 className="hero-title">Timeless <br /><span className="outline-text">Hierarchy</span></h1>
              <p className="hero-subtext">Witness the convergence of Medusa&apos;s mythical power and uncompromising Swiss precision.</p>
            </motion.div>

            {/* Scroll indicator — outside intro-phase, centered on full viewport */}
            <motion.div 
              style={{ opacity: introOpacity }}
              className="scroll-indicator-luxury"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <div className="scroll-line" />
              <span>Scroll to Unveil</span>
            </motion.div>

            {/* Phase 2: Feature 1 (Top Left) */}
            <motion.div 
              style={{ opacity: feat1Opacity, x: feat1X }}
              className="feature-callout f-top-left"
            >
              <div className="callout-header">
                <span className="callout-num">01</span>
                <div className="callout-line" />
              </div>
              <div className="callout-body">
                <h3>Sapphire Mirror</h3>
                <p>Double-domed sapphire with anti-reflective coating for absolute clarity.</p>
              </div>
            </motion.div>

            {/* Phase 3: Feature 2 (Bottom Right) */}
            <motion.div 
              style={{ opacity: feat2Opacity, x: feat2X }}
              className="feature-callout f-bottom-right"
            >
              <div className="callout-header">
                <span className="callout-num">02</span>
                <div className="callout-line" />
              </div>
              <div className="callout-body">
                <h3 className="glow-text">Swiss Heartbeat</h3>
                <p>High-precision Ronda 512.2 movement, calibrated to the micro-second.</p>
              </div>
            </motion.div>

            {/* Phase 4: Feature 3 (Bottom Left) */}
            <motion.div 
              style={{ opacity: feat3Opacity, y: feat3Y }}
              className="feature-callout f-bottom-left"
            >
              <div className="callout-header">
                <span className="callout-num">03</span>
                <div className="callout-line" />
              </div>
              <div className="callout-body">
                 <h3>316L Build</h3>
                 <p>Architectural stainless steel finished with hand-polished Greca details.</p>
              </div>
            </motion.div>

            {/* Final Phase */}
            <motion.div 
              style={{ opacity: finalOpacity, scale: finalScale }}
              className="sequence-overlay-text final-phase"
            >
              <span className="s-tag">EXTREME ENGINEERING</span>
              <h2 className="final-title">Hellenium <span className="emerald-accent">VK</span></h2>
              <p className="final-subtext">A structural triumph in brushed steel and emerald radiance.</p>
              <div className="hero-cta-group">
                <motion.button 
                  whileHover={{ scale: 1.05, letterSpacing: "0.4rem" }}
                  className="btn-luxury-main"
                >
                  Configure Yours
                </motion.button>
              </div>
            </motion.div>

          </div>
        </section>

        {/* The Elevation Section - Detailed & Unique Price View */}
        <section id="about" className="elevation-section">
          <div className="container">
            <div className="elevation-layout">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="elevation-text"
              >
                <div className="section-tag">ELITE CRAFTSMANSHIP</div>
                <h2>Where <br /><span className="emerald-text">Legacy</span> meets <br />Avant-Garde.</h2>
                <div className="reveal-box">
                  <p>The Hellenium-VK is more than a watch—it&apos;s an artifact of high-performance luxury. Built to withstand the tests of time with 5 ATM water resistance and a scratch-resistant Sapphire lens.</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 50, rotateY: 20 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="price-card-unique"
              >
                <div className="price-top">
                  <span className="sku-label">SKU: VEVK00620</span>
                  <div className="status-dot">IN STOCK</div>
                </div>
                <div className="price-main">
                  <span className="currency">₹</span>
                  <span className="amount">1,14,995</span>
                </div>
                <div className="price-features">
                  <div className="p-feature">
                    <Clock size={16} />
                    <span>48-Month Global Warranty</span>
                  </div>
                  <div className="p-feature">
                    <Zap size={16} />
                    <span>Priority Shipping</span>
                  </div>
                </div>
                <div className="price-bottom-text">
                   Milanese Mastery. Engineered in Switzerland.
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Excellence Icons - Apple Style Grid */}
        <section className="excellence-section">
          <div className="container">
            <div className="grid-columns-3">
              {[
                { icon: ShieldCheck, title: "100% Genuine", desc: "Triple-certified by Titan Trust for absolute peace of mind." },
                { icon: Lock, title: "Secure Payment", desc: "Military-grade encryption for all financial interactions." },
                { icon: MapPin, title: "Seamless Delivery", desc: "White-glove service to 25,000+ pincodes across the country." }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: idx * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="excellence-card"
                >
                  <item.icon size={48} strokeWidth={1} />
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Quick-View - Scroll Animated Interaction */}
        <section id="quick-view" className="quick-view-section dark-variant">
          <div className="container grid-split">
            {/* Left Column: Gallery */}
            <div className="gallery-column">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="gallery-main-premium"
              >
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeThumb}
                    initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    src={images[activeThumb]} 
                    alt="Watch Detail View" 
                    className="gallery-img-p" 
                  />
                </AnimatePresence>
              </motion.div>
              <div className="gallery-thumbs-p">
                {images.map((img, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + (idx * 0.1) }}
                    whileHover={{ scale: 1.05, borderColor: "var(--primary-green)" }}
                    whileTap={{ scale: 0.95 }}
                    className={`thumb-p ${activeThumb === idx ? 'active' : ''}`}
                    onClick={() => setActiveThumb(idx)}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="purchase-column-p"
            >
              <div className="delivery-card-premium">
                  <h3 className="section-title-sm">Ownership Check</h3>
                  <div className="delivery-check-p">
                    <label>Validate Shipping Area</label>
                    <div className="input-group-p">
                      <input 
                        type="text" 
                        placeholder="000000" 
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                      <button onClick={handlePincodeCheck}>Verify</button>
                    </div>
                    <p className={`d-status ${isError ? 'err' : 'ok'}`}>{deliveryMsg}</p>
                  </div>
                  
                  <div className="buy-cta-group">
                    <motion.button 
                      whileHover={{ scale: 1.02, letterSpacing: "0.4rem" }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-luxury-buy"
                    >
                      Acquire Now
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-luxury-wish"
                    >
                      Add to Collection
                    </motion.button>
                  </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technical Specifications - Macro View Section */}
        <section id="specs" className="specs-section-large">
          <div className="container">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="specs-header-large"
            >
              <span className="section-tag-c">THE BLUEPRINT</span>
              <h2>Technical <br />Hierarchies</h2>
            </motion.div>
            
            <div className="specs-grid-large">
              {[
                { 
                  icon: Zap, 
                  title: "Engine", 
                  specs: [
                    { label: "Movement", val: "Ronda 512.2" },
                    { label: "Calibre", val: "Swiss Quartz" }
                  ]
                },
                { 
                  icon: GlassWater, 
                  title: "Protection", 
                  specs: [
                    { label: "Crystal", val: "Sapphire Mirror", highlight: true },
                    { label: "Resistance", val: "50M Water Resistance", highlight: true }
                  ]
                },
                { 
                  icon: Construction, 
                  title: "Form", 
                  specs: [
                    { label: "Material", val: "316L Stainless Steel" },
                    { label: "Finish", val: "Polished & Brushed" }
                  ]
                }
              ].map((group, gIdx) => (
                <motion.div 
                  key={gIdx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: gIdx * 0.2 }}
                  className="spec-group-l"
                >
                  <div className="spec-header-l">
                    <group.icon size={32} className="emerald-icon" />
                    <h3>{group.title}</h3>
                  </div>
                  {group.specs.map((spec: { label: string; val: string; highlight?: boolean }, sIdx) => (
                    <div key={sIdx} className="spec-item-l">
                      <span className="label">{spec.label}</span>
                      <span className={`val ${spec.highlight ? 'highlight' : ''}`}>{spec.val}</span>
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Heritage Immersive */}
        <section id="heritage" className="heritage-immersive">
          <div className="immersive-bg">
            <div className="inner-overlay" />
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="container text-center-l"
            >
              <motion.div 
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
                className="section-tag-gold"
              >
                CASA VERSACE
              </motion.div>
              <motion.h2
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                A Legacy <br />In Hand.
              </motion.h2>
              <motion.p 
                initial={{ y: 40, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.7 }}
                className="max-w-md"
              >
                The Medusa emblem and Greca motifs aren&apos;t just details—they&apos;re symbols of a decades-long pursuit of Italian excellence, refined in the watchmaking valleys of Switzerland.
              </motion.p>
              
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 1 }}
                className="care-immersive-quote"
              >
                <motion.blockquote
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 1.5 }}
                >
                  &quot;Luxury is the attention to detail that remains invisible until felt.&quot;
                </motion.blockquote>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="footer-black">
        <div className="container footer-content-f">
          <motion.div 
            initial={{ opacity: 0, letterSpacing: "0rem" }}
            whileInView={{ opacity: 0.1, letterSpacing: "3rem" }}
            viewport={{ once: true }}
            transition={{ duration: 2 }}
            className="f-logo"
          >
            VERSACE
          </motion.div>
          <div className="f-bottom">
             <div className="f-links">
                <a href="#">Concierge</a>
                <a href="#">Provenance</a>
                <a href="#">Privacy</a>
             </div>
             <p className="copy">© 2024 Versace. The Hellenium Collection.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
