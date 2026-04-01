export const AIComparePanel = ({ original, improved, onApply }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    <div className="liquid-glass rounded-[28px] p-5">
      <p className="text-xs uppercase tracking-[0.28em] text-white/42">Before</p>
      <p className="mt-4 text-sm leading-7 text-white/72">{original}</p>
    </div>
    <div className="liquid-glass-strong rounded-[28px] p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">After AI</p>
        {onApply ? (
          <button type="button" onClick={onApply} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
            Apply
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-sm leading-7 text-white/78">{improved}</p>
    </div>
  </div>
);
