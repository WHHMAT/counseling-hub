import React from 'react';

interface DonationPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const DonationPopup: React.FC<DonationPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="mx-auto bg-sky-100 rounded-full h-16 w-16 flex items-center justify-center mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Grazie per il tuo impegno!</h2>
        <p className="text-gray-600 mb-6">
          Questa piattaforma è e rimarrà gratuita. Se trovi utili questi strumenti, considera di fare una piccola donazione per sostenere i progetti per i bambini in Kenya e Uganda che portiamo avanti con l'APS "Nello Sguardo di un Altro".
        </p>
        <a
          href="https://gofund.me/bc7eb9f8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-amber-500 text-white px-8 py-3 rounded-full font-semibold transition-transform transform hover:scale-105 shadow-lg"
        >
          Fai una Donazione
        </a>
      </div>
    </div>
  );
};

export default DonationPopup;