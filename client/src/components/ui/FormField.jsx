export const FormField = ({ label, as = 'input', className = '', ...props }) => {
  const Component = as;

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-300">{label}</span>
      <Component
        {...props}
        className={`w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-accent ${className}`}
      />
    </label>
  );
};

