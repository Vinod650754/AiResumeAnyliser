import { motion } from 'framer-motion';
import { templateCategories, templateRegistry } from '../../data/templateRegistry.js';

export const TemplateSelector = ({ activeTemplate, onSelect }) => (
  <div className="space-y-5">
    {templateCategories.map((category) => (
      <div key={category} className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.32em] text-white/45">{category}</p>
          <p className="text-xs text-white/35">
            {templateRegistry.filter((template) => template.category === category).length} options
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {templateRegistry
            .filter((template) => template.category === category)
            .map((template) => (
              <motion.button
                key={template.id}
                type="button"
                whileHover={{ y: -3, scale: 1.01 }}
                onClick={() => onSelect(template.id)}
                className={`rounded-[28px] border p-4 text-left transition ${
                  activeTemplate === template.id
                    ? 'border-cyan-300/60 bg-white/12 shadow-[0_0_40px_rgba(34,211,238,0.18)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20'
                }`}
              >
                <div
                  className="mb-4 h-28 rounded-[22px] border border-black/5"
                  style={{
                    background: `linear-gradient(145deg, ${template.accent}22, transparent 60%), linear-gradient(180deg, rgba(255,255,255,.12), rgba(255,255,255,.02))`
                  }}
                />
                <p className="font-medium text-white">{template.name}</p>
                <p className="mt-1 text-sm text-white/50">{template.layout} layout</p>
              </motion.button>
            ))}
        </div>
      </div>
    ))}
  </div>
);

