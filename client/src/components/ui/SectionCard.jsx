import { motion } from 'framer-motion';

export const SectionCard = ({ title, description, children, actions }) => (
  <motion.section
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="liquid-glass rounded-[32px] p-6"
  >
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-4xl italic text-white">{title}</h2>
        {description ? <p className="mt-2 text-sm text-white/55">{description}</p> : null}
      </div>
      {actions}
    </div>
    {children}
  </motion.section>
);
