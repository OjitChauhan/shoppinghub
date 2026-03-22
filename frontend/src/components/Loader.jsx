import { motion } from "framer-motion";

const orbitRadius = 30;
const dotSize = 12;
const colors = ["#3CBEAC", "#285570"];

const variants = {
  orbit: (custom) => ({
    rotate: 360,
    transition: {
      repeat: Infinity,
      duration: 2.5,
      ease: "linear",
      delay: custom * 0.3,
    }
  }),
  dot: (custom) => ({
    scale: [1, 1.5, 1],
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut",
      delay: custom * 0.3,
    }
  })
};

const OrbitalLoader = () => {
  return (
    <div
      style={{
        width: 120,
        height: 120,
        position: "relative",
        margin: "auto",
      }}
    >
      {[0, 1].map(i => (
        <motion.div
          key={i}
          custom={i}
          variants={variants.orbit}
          animate="orbit"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <motion.div
            custom={i}
            variants={variants.dot}
            animate="dot"
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              backgroundColor: colors[i],
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: -dotSize / 2,
              marginLeft: -orbitRadius,
              transformOrigin: `calc(50% + ${orbitRadius}px) center`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default OrbitalLoader;



