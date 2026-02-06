export default function SectionHero({ data }) {
  return (
    <section className="relative min-h-[500px] flex items-center justify-center bg-gradient-to-br from-red-50 to-white overflow-hidden">
      {data.image && (
        <div className="absolute inset-0 opacity-10">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {data.subtitle && (
            <p className="text-red-600 font-semibold mb-4">{data.subtitle}</p>
          )}
          {data.title && (
            <h1 className="text-5xl font-bold text-zinc-900 mb-6">{data.title}</h1>
          )}
          {data.content && (
            <p className="text-xl text-zinc-600 leading-relaxed">{data.content}</p>
          )}
        </div>
      </div>
    </section>
  )
}
