export const PremiumATSInsights = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="liquid-glass rounded-[30px] p-6">
        <p className="text-white/55">Run ATS analysis to generate score, missing keywords, and AI guidance.</p>
      </div>
    );
  }

  return (
    <div className="liquid-glass space-y-5 rounded-[30px] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-white/42">ATS Score</p>
          <p className="font-display text-5xl italic text-white">{analysis.score}</p>
          <p className="mt-2 text-sm text-cyan-200/85">{analysis.keywordCoverage}% keyword coverage</p>
        </div>
        <div className="relative grid h-24 w-24 place-items-center rounded-full border border-cyan-300/20 bg-white/[0.03]">
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: `conic-gradient(#67e8f9 ${analysis.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)`
            }}
          />
          <div className="absolute inset-[14px] rounded-full bg-black" />
          <span className="relative text-sm font-semibold text-white">{analysis.score}%</span>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-white">Missing skills</p>
        <div className="flex flex-wrap gap-2">
          {analysis.missingSkills?.length ? (
            analysis.missingSkills.map((item) => (
              <span key={item} className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-white/55">No critical gaps detected.</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-white">AI suggestions</p>
        <ul className="space-y-2 text-sm text-white/72">
          {analysis.suggestions?.map((item) => (
            <li key={item}>• {item}</li>
          ))}
          {analysis.grammarNotes?.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

