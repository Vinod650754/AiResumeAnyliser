export const ATSInsights = ({ analysis }) => {
  if (!analysis) {
    return (
      <div className="glass-panel p-6">
        <p className="text-slate-400">Save the resume to generate ATS analysis.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">ATS Score</p>
          <p className="font-display text-4xl font-bold">{analysis.score}</p>
        </div>
        <div className="rounded-full border border-glow/30 bg-glow/10 px-4 py-2 text-sm text-glow">
          {analysis.keywordCoverage}% keyword coverage
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">Missing skills</p>
        <div className="flex flex-wrap gap-2">
          {analysis.missingSkills?.length ? (
            analysis.missingSkills.map((item) => (
              <span key={item} className="rounded-full bg-roseglow/10 px-3 py-1 text-xs text-roseglow">
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-400">No critical gaps detected.</span>
          )}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">AI suggestions</p>
        <ul className="space-y-2 text-sm text-slate-300">
          {analysis.suggestions?.map((item) => <li key={item}>• {item}</li>)}
          {analysis.grammarNotes?.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      </div>
    </div>
  );
};

