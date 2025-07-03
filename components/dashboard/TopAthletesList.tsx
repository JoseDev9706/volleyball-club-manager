
import React, { useMemo, useEffect } from 'react';
import { Player } from '../../types';
import { useData } from '../../context/DataContext';
import Card from '../ui/Card';

const getTrophyColor = (rank: number) => {
  switch(rank) {
    case 0: return 'text-yellow-400';
    case 1: return 'text-gray-400';
    case 2: return 'text-yellow-600';
    default: return 'text-gray-500';
  }
};

const TopAthletesList: React.FC = () => {
  const { players, loading } = useData();
  
  useEffect(() => {
    if(!loading && typeof (window as any).lucide !== 'undefined') {
        (window as any).lucide.createIcons();
    }
  }, [loading, players])

  const topAthletes = useMemo(() => {
    if (!players || players.length === 0) return [];

    const getLatestStats = (player: Player) => {
        if (!player.statsHistory || player.statsHistory.length === 0) {
            return { attack: 0, defense: 0, block: 0, pass: 0 };
        }
        return [...player.statsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].stats;
    };

    return [...players]
      .map(player => {
        const stats = getLatestStats(player);
        const totalScore = stats.attack + stats.defense + stats.block + stats.pass;
        return { ...player, totalScore, currentStats: stats };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);
  }, [players]);
  
  if (loading) {
      return <Card className="h-full flex items-center justify-center"><p>Cargando atletas...</p></Card>;
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-text-primary">Top 5 Atletas</h2>
      <ul className="space-y-4">
        {topAthletes.map((player, index) => (
          <li key={player.id} className="flex items-center gap-4 p-2 rounded-md bg-gray-800">
            <span className={`font-bold text-lg w-5 ${getTrophyColor(index)}`}>
              <i data-lucide="trophy" className="w-6 h-6"></i>
            </span>
            <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{player.name}</p>
              <p className="text-sm text-text-secondary">Puntuación Total: {player.totalScore}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-text-secondary">A: {player.currentStats.attack} D: {player.currentStats.defense}</p>
                 <p className="text-xs text-text-secondary">B: {player.currentStats.block} P: {player.currentStats.pass}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default TopAthletesList;
