export default function SectionCard({ data }) {
  let cards = []
  
  // Parse JSON data if exists
  if (data.data) {
    try {
      const parsed = JSON.parse(data.data)
      cards = parsed.cards || []
    } catch (e) {
      console.error('Failed to parse cards data')
    }
  }

  return (
    <section className="py-16 bg-zinc-50">
      <div className="container mx-auto px-6">
        {data.subtitle && (
          <p className="text-red-600 font-semibold text-center mb-3">{data.subtitle}</p>
        )}
        {data.title && (
          <h2 className="text-4xl font-bold text-zinc-900 text-center mb-12">{data.title}</h2>
        )}
        
        {cards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
              >
                {card.image && (
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                {card.title && (
                  <h3 className="text-xl font-bold text-zinc-900 mb-3">{card.title}</h3>
                )}
                {card.description && (
                  <p className="text-zinc-600">{card.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500">{data.content || 'No content available'}</p>
        )}
      </div>
    </section>
  )
}
