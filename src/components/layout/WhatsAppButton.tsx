export default function WhatsAppButton() {
  const phoneNumber = "5519992505370";
  const message = "Olá! Preciso de ajuda com o FinanceMEI";
  
  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group"
      aria-label="Contato via WhatsApp"
    >
      <i className="ri-whatsapp-line text-3xl"></i>
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Precisa de ajuda?
      </span>
    </button>
  );
}
