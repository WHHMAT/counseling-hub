import React, { useState } from 'react';

const FeedbackForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        throw new Error('Invio del modulo fallito. Riprova.');
      }
    } catch (e) {
        if(e instanceof Error) {
            setError(e.message);
        } else {
            setError('Si è verificato un errore sconosciuto.');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Grazie per il tuo feedback!</h2>
        <p className="text-gray-600 mt-2">Apprezziamo il tuo contributo per migliorare questo strumento.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">Hai un feedback?</h2>
      <p className="text-gray-600 text-center mb-6">Aiutaci a migliorare. Scrivici un suggerimento o segnala un problema.</p>
      <form
        name="feedback"
        method="POST"
        data-netlify="true"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="feedback" />
        
        <div className="mb-4">
          <label htmlFor="message" className="block text-md font-semibold text-gray-700 mb-2">
            Il tuo Messaggio
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition shadow-sm"
            placeholder="Vorrei suggerire..."
          ></textarea>
        </div>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}
        
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-sky-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out hover:bg-sky-700 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Invio in corso...' : 'Invia Feedback'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;
