
import React from 'react';
import { Link } from 'react-router-dom';
import { Player } from '../../types';
import Card from '../ui/Card';

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => {
    
  const getLatestStats = (p: Player) => {
    if (!p.statsHistory || p.statsHistory.length === 0) {
      return { attack: 0, defense: 0, block: 0, pass: 0 };
    }
    return [...p.statsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].stats;
  };

  const latestStats = getLatestStats(player);

  return (
    <Card className="flex flex-col items-center text-center !p-4 transition-transform duration-300 hover:scale-105 hover:shadow-primary/20">
      <Link to={`/player/${player.id}`}>
        <img src={player.avatarUrl} alt={player.name} className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-primary" />
      </Link>
      <h3 className="text-lg font-bold text-text-primary">
        <Link to={`/player/${player.id}`} className="hover:text-primary transition-colors">
            {player.name}
        </Link>
      </h3>
      <p className="text-sm text-text-secondary">{player.subCategory} / {player.position}</p>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {player.mainCategories.map(cat => (
          <span key={cat} className="text-xs bg-gray-600 text-text-primary px-2 py-1 rounded-full">{cat}</span>
        ))}
      </div>
      <div className="w-full mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 gap-2 text-sm">
        <p><span className="font-semibold">Ataque:</span> {latestStats.attack}</p>
        <p><span className="font-semibold">Defensa:</span> {latestStats.defense}</p>
        <p><span className="font-semibold">Bloqueo:</span> {latestStats.block}</p>
        <p><span className="font-semibold">Pase:</span> {latestStats.pass}</p>
      </div>
    </Card>
  );
};

export default PlayerCard;