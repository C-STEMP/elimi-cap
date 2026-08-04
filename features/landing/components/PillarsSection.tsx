const PILLARS = [
  {
    num: "01",
    title: "Structured TVET Curricula",
    desc: "Trade, level, module, unit, lesson and activity hierarchy that mirrors how NSQ vocational programmes are actually built.",
  },
  {
    num: "02",
    title: "Standard Interoperability",
    desc: "Upload and launch externally authored SCORM, xAPI and HTML5 packages — authoring tools are first‑class inputs, not an afterthought.",
  },
  {
    num: "03",
    title: "Multi-Tenant By Design",
    desc: "One platform, many institutions, programmes and cohorts — each with its own learners, roles and data boundaries.",
  },
  {
    num: "04",
    title: "Evidence-Based Assessment",
    desc: "Learners upload practical evidence; assessors verify against NSQ criteria; IQA/EQA audit the trail. The capability that makes a completion defensible.",
  },
  {
    num: "05",
    title: "Institutional Reporting",
    desc: "Progress, completion, assessment and evidence reporting filtered by cohort, tenant, programme or state — visibility for funders and Management.",
  },
  {
    num: "06",
    title: "Flexible Access & Commercials",
    desc: "Institutional bulk, sponsored, voucher, subscription and invoice‑based access — designed for how programmes are really funded.",
  },
  {
    num: "07",
    title: "White-Label Ready",
    desc: "Tenant branding so institutional clients can deliver learning in their own identity, on architecture prepared for it from day one.",
  },
  {
    num: "08",
    title: "Mobile-First & Accessible",
    desc: "OThe full learner journey — access, learn, resume, complete — works on the phones trainees actually use.",
  },
  {
    num: "09",
    title: "AI-Ready & Scalable",
    desc: "Data structures and xAPI‑ready records that won’t block future AI tutoring, feedback and analytics — or growth to more trades, states and partners.",
  },
];

export function PillarsSection() {
  return (
    <section className="bg-slate-50/70 py-16 lg:py-24" id="pillars">
      <div className="mx-auto sm:px-6 lg:px-8 xl:px-16">
        <div className="text-center" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-black">
            Built On <span className="text-primary">Nine Product</span> Pillars
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-black leading-relaxed">
            A comprehensive solution designed to handle every aspect of
            technical and vocational education management.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar, idx) => (
            <div
              key={pillar.num}
              data-aos="fade-up"
              data-aos-delay={(idx % 3) * 100 + 100}
              className="group rounded-xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-xs font-extrabold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                {pillar.num}
              </div>
              <h3 className="mt-4 text-lg font-bold text-text-dark">
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
