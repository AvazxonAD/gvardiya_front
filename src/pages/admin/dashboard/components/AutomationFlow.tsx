const steps = [
  {
    label: "1-qadam",
    title: "Tadbir kiritish",
    percent: "90%",
    percentColor: "text-amber-500",
    iconBg: "bg-indigo-500/20",
    iconColor: "text-indigo-500",
    cardExtra: "",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    ),
    labelClass: "text-[var(--dash-text-secondary)]",
    titleClass: "font-medium",
  },
  {
    label: "2-qadam",
    title: "Xodimlar biriktirish",
    percent: "70%",
    percentColor: "text-amber-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    cardExtra: "",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    ),
    labelClass: "text-[var(--dash-text-secondary)]",
    titleClass: "font-medium",
  },
  {
    label: "3-qadam",
    title: "Avtomatik Formula",
    percent: "100%",
    percentColor: "text-emerald-500",
    iconBg: "bg-teal-500/20",
    iconColor: "text-teal-500",
    cardExtra: "border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.1)]",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    ),
    labelClass: "text-teal-500",
    titleClass: "font-bold",
  },
  {
    label: "Natija",
    title: "Hisoblangan summa",
    percent: "100%",
    percentColor: "text-emerald-500",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-500",
    cardExtra: "border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    labelClass: "text-blue-500",
    titleClass: "font-bold",
  },
];

const Arrow = () => (
  <svg className="w-5 h-5 text-[var(--dash-text-muted)] hidden md:block animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function AutomationFlow() {
  return (
    <div className="dash-glass p-[16px] relative overflow-hidden flex flex-col justify-center">
      <h2 className="text-[16px] font-semibold mb-2 text-blue-500">
        Inson omilini kamaytirish mexanizmi (Avtomatlashtirish)
      </h2>

      <div className="flex flex-col md:flex-row items-center justify-between gap-[8px]">
        {steps.map((step, i) => (
          <div key={i} className="contents">
            <div
              className={`w-full md:w-auto flex-1 dash-glass py-2 px-3 h-[60px] rounded-xl flex items-center transform transition hover:scale-105 ${step.cardExtra}`}
            >
              <div className={`w-8 h-8 rounded-full ${step.iconBg} flex items-center justify-center mr-3 ${step.iconColor}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {step.icon}
                </svg>
              </div>
              <div className="flex-1">
                <p className={`text-[11px] ${step.labelClass} leading-tight`}>{step.label}</p>
                <p className={`text-[13px] ${step.titleClass} text-[var(--dash-text)]`}>{step.title}</p>
              </div>
              <span className={`text-[12px] font-bold ${step.percentColor} ml-2`}>{step.percent}</span>
            </div>
            {i < steps.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </div>
  );
}
