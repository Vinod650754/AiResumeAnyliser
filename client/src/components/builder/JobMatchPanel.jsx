export const JobMatchPanel = ({ matches = [] }) => (
  <div className="grid gap-4">
    {matches.length ? (
      matches.map((match) => (
        <div key={`${match.company}-${match.title}`} className="liquid-glass rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-white">{match.title}</p>
              <p className="text-sm text-white/55">{match.company}</p>
            </div>
            <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
              {match.matchScore}%
            </div>
          </div>
          <p className="mt-3 text-sm text-white/72">{match.reason}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {match.missingSkills?.map((skill) => (
              <span key={skill} className="rounded-full bg-rose-400/10 px-3 py-1 text-xs text-rose-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div className="liquid-glass rounded-[28px] p-5 text-white/55">Generate job matches to see recommended roles.</div>
    )}
  </div>
);

