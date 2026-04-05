export const FormField = ({ label, as = 'input', className = '', ...props }) => {
  const Component = as;

  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</span>
      <Component
        {...props}
        className={`w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200/50 focus:bg-white/[0.08] ${className}`}
      />
    </label>
  );
};
