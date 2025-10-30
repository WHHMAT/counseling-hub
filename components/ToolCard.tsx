import React from 'react';
import type { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
  onStart: (id: string) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onStart }) => {
  const handleActionClick = () => {
    if (!tool.comingSoon) {
      onStart(tool.id);
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
      {tool.comingSoon && (
        <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          In Arrivo
        </div>
      )}
      <div className="bg-sky-100 text-sky-600 rounded-full p-4 mb-5">
        {tool.icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{tool.title}</h3>
      <p className="text-gray-600 mb-6 flex-grow">{tool.description}</p>
      <button
        onClick={handleActionClick}
        disabled={tool.comingSoon}
        className={`w-full text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 ease-in-out
          ${
            tool.comingSoon
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-700 shadow-md hover:shadow-lg'
          }`}
      >
        {tool.actionText}
      </button>
    </div>
  );
};

export default ToolCard;
