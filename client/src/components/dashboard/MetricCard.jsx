import { motion } from 'framer-motion';

export const MetricCard = ({ label, value, hint }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="liquid-glass rounded-[30px] p-5"
  >
    <p className="text-sm uppercase tracking-[0.24em] text-white/38">{label}</p>
    <p className="mt-3 font-display text-5xl italic text-white">{value}</p>
    <p className="mt-2 text-sm text-white/52">{hint}</p>
  </motion.div>
);
