import React from 'react';
import { Star } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-hover shadow-lg border border-gray-100">
      <div className="relative">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{game.title}</h3>
        <p className="text-gray-600 text-sm mb-4">{game.description}</p>
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {game.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-sm font-medium text-gray-900">{game.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}