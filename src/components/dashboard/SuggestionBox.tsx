import { useState } from 'react';

export default function SuggestionBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);

    try {
      // Usando FormSubmit.co para envio de email gratuito
      const response = await fetch('https://formsubmit.co/ajax/contato@viniciusclemente.com.br', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Nova Sugestão - FinanceMEI',
          message: message,
          _template: 'box'
        })
      });

      if (response.ok) {
        setSent(true);
        setMessage('');
        setTimeout(() => {
          setIsOpen(false);
          setSent(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert('Erro ao enviar sugestão. Tente novamente.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Botão Flutuante */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-32 right-6 lg:bottom-24 lg:right-8 w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center z-40 group"
        title="Enviar Sugestão"
      >
        <i className="ri-lightbulb-line text-2xl group-hover:scale-110 transition-transform duration-300"></i>
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
          💡
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <i className="ri-lightbulb-line text-2xl text-purple-600"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Envie sua Sugestão
                  </h3>
                  <p className="text-xs text-gray-500">
                    Ajude-nos a melhorar! 🚀
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Form */}
            {!sent ? (
              <form onSubmit={handleSubmit}>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Compartilhe suas ideias, sugestões ou melhorias para o FinanceMEI... 💭"
                  className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none text-gray-900 bg-white placeholder-gray-400 transition-colors duration-200"
                  required
                  disabled={sending}
                />

                {/* Footer */}
                <div className="flex items-center justify-end mt-4">
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      <>
                        <i className="ri-loader-4-line animate-spin"></i>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-fill"></i>
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-3xl text-green-600"></i>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Sugestão Enviada! ✅
                </h4>
                <p className="text-sm text-gray-600">
                  Obrigado pelo feedback! 🙏
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
