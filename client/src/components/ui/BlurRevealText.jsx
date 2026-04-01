import { motion } from 'framer-motion';

export const BlurRevealText = ({ text, className = '' }) => {
  const words = text.split(' ');

  return (
    <div className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, filter: 'blur(14px)', y: 22 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.55, delay: index * 0.05 }}
          className="mr-[0.28em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};
