export default function SectionContent({ data }) {
  const hasImage = data.image
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className={`flex flex-col ${hasImage ? 'md:flex-row' : ''} gap-12 items-center`}>
          {hasImage && (
            <div className="md:w-1/2">
              <img 
                src={data.image} 
                alt={data.title} 
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>
          )}
          <div className={hasImage ? 'md:w-1/2' : 'max-w-4xl mx-auto'}>
            {data.subtitle && (
              <p className="text-red-600 font-semibold mb-3">{data.subtitle}</p>
            )}
            {data.title && (
              <h2 className="text-4xl font-bold text-zinc-900 mb-6">{data.title}</h2>
            )}
            {data.content && (
              <div className="text-lg text-zinc-700 leading-relaxed whitespace-pre-line">
                {data.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
