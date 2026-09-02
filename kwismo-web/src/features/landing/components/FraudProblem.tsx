export default function FraudProblem() {
  const statistics = [
    {
      value: '1 / 3 min',
      label: 'Vishing',
    },
    {
      value: '87 %',
      label: 'SIM Swap de tentatives\nréussies',
    },
    {
      value: '+340 %',
      label: 'Piratage WhatsApp\nen un an',
    },
    {
      value: '65 %',
      label: 'Ingénierie sociale de\ntoutes les fraudes',
    },
  ];

  return (
    <section
      id="fraud"
      className="w-full bg-white px-6 py-[70px]"
    >
      <div className="mx-auto max-w-[1200px]">

        {/* Titre */}
        <div className="text-center">
          <h2 className="font-title text-[40px] font-bold leading-[56px] text-[#151D34]">
            La fraude mobile money explose
          </h2>
        </div>

        {/* Statistiques */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat) => (
            <div
              key={stat.value}
              className="flex h-[84px] flex-col items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-center"
            >
              <span className="font-body text-[20px] font-semibold leading-[27px] text-[#31B58A]">
                {stat.value}
              </span>

              <span className="mt-1 whitespace-pre-line font-body text-[12px] font-normal leading-[16px] text-[#151D34]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}