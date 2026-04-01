export const templateRegistry = [
  { id: 'nova', name: 'Nova Prime', category: 'Professional', layout: 'split', accent: '#7dd3fc', surface: 'bg-white', text: 'text-slate-950' },
  { id: 'eclipse', name: 'Eclipse Noir', category: 'Executive', layout: 'stacked', accent: '#a78bfa', surface: 'bg-[#050816]', text: 'text-white' },
  { id: 'aurora', name: 'Aurora Beam', category: 'Creative', layout: 'hero', accent: '#5eead4', surface: 'bg-gradient-to-br from-sky-50 via-white to-cyan-50', text: 'text-slate-950' },
  { id: 'vector', name: 'Vector Slate', category: 'Tech', layout: 'split', accent: '#60a5fa', surface: 'bg-slate-100', text: 'text-slate-950' },
  { id: 'meridian', name: 'Meridian Pro', category: 'Corporate', layout: 'stacked', accent: '#f59e0b', surface: 'bg-white', text: 'text-slate-900' },
  { id: 'atlas', name: 'Atlas Board', category: 'Executive', layout: 'hero', accent: '#fb7185', surface: 'bg-stone-100', text: 'text-stone-900' },
  { id: 'zenith', name: 'Zenith Edge', category: 'Tech', layout: 'split', accent: '#38bdf8', surface: 'bg-[#0f172a]', text: 'text-white' },
  { id: 'lumen', name: 'Lumen Soft', category: 'Minimal', layout: 'stacked', accent: '#34d399', surface: 'bg-[#f8fafc]', text: 'text-slate-900' },
  { id: 'orbit', name: 'Orbit Glass', category: 'Professional', layout: 'hero', accent: '#22d3ee', surface: 'bg-white', text: 'text-slate-950' },
  { id: 'summit', name: 'Summit Serif', category: 'Corporate', layout: 'stacked', accent: '#c084fc', surface: 'bg-[#faf5ff]', text: 'text-slate-950' },
  { id: 'quartz', name: 'Quartz Clean', category: 'Minimal', layout: 'split', accent: '#94a3b8', surface: 'bg-white', text: 'text-slate-900' },
  { id: 'forge', name: 'Forge Grid', category: 'Tech', layout: 'hero', accent: '#f97316', surface: 'bg-[#111827]', text: 'text-white' },
  { id: 'canvas', name: 'Canvas One', category: 'Creative', layout: 'split', accent: '#ec4899', surface: 'bg-[#fff1f2]', text: 'text-slate-900' },
  { id: 'pulse', name: 'Pulse UX', category: 'Creative', layout: 'hero', accent: '#06b6d4', surface: 'bg-[#ecfeff]', text: 'text-slate-900' },
  { id: 'signal', name: 'Signal Stack', category: 'Tech', layout: 'stacked', accent: '#818cf8', surface: 'bg-[#eef2ff]', text: 'text-slate-950' },
  { id: 'pillar', name: 'Pillar Board', category: 'Corporate', layout: 'split', accent: '#f43f5e', surface: 'bg-white', text: 'text-slate-900' },
  { id: 'campus', name: 'Campus Start', category: 'Student', layout: 'stacked', accent: '#10b981', surface: 'bg-[#f0fdf4]', text: 'text-slate-900' },
  { id: 'launch', name: 'Launch Pad', category: 'Student', layout: 'hero', accent: '#3b82f6', surface: 'bg-[#eff6ff]', text: 'text-slate-900' },
  { id: 'folio', name: 'Folio Core', category: 'Professional', layout: 'split', accent: '#6366f1', surface: 'bg-white', text: 'text-slate-900' },
  { id: 'verge', name: 'Verge Modern', category: 'Professional', layout: 'stacked', accent: '#14b8a6', surface: 'bg-[#f0fdfa]', text: 'text-slate-900' },
  { id: 'helios', name: 'Helios Rise', category: 'Executive', layout: 'hero', accent: '#f59e0b', surface: 'bg-[#fffbeb]', text: 'text-slate-900' },
  { id: 'craft', name: 'Craft Studio', category: 'Creative', layout: 'stacked', accent: '#8b5cf6', surface: 'bg-[#faf5ff]', text: 'text-slate-900' },
  { id: 'boardroom', name: 'Boardroom X', category: 'Executive', layout: 'split', accent: '#0ea5e9', surface: 'bg-[#f8fafc]', text: 'text-slate-900' },
  { id: 'kernel', name: 'Kernel Dev', category: 'Tech', layout: 'stacked', accent: '#22c55e', surface: 'bg-[#052e16]', text: 'text-white' }
];

export const templateCategories = ['Professional', 'Minimal', 'Creative', 'Corporate', 'Student', 'Tech', 'Executive'];

export const getTemplateById = (templateId) =>
  templateRegistry.find((template) => template.id === templateId) || templateRegistry[0];
