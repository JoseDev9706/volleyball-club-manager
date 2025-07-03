
import React, { useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { Team } from '../../types';
import Card from '../ui/Card';

const TournamentOverview: React.FC = () => {
    const { teams, loading } = useData();

    useEffect(() => {
        if (!loading && typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }, [loading, teams]);

    const tournaments = useMemo(() => {
        if (!teams) return {};
        
        const groupedByTournament: Record<string, Team[]> = teams.reduce((acc, team) => {
            if (team.tournament) {
                if (!acc[team.tournament]) {
                    acc[team.tournament] = [];
                }
                acc[team.tournament].push(team);
            }
            return acc;
        }, {} as Record<string, Team[]>);
        
        return groupedByTournament;
    }, [teams]);

    const tournamentNames = Object.keys(tournaments);

    if (loading) {
        return <Card className="h-full flex items-center justify-center"><p>Cargando torneos...</p></Card>;
    }

    if (tournamentNames.length === 0) {
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Resumen de Torneos</h2>
                <div className="text-center py-4 text-text-secondary">
                    <i data-lucide="info" className="w-8 h-8 mx-auto mb-2"></i>
                    <p>No hay equipos participando en torneos actualmente.</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-text-primary">Resumen de Torneos</h2>
            <div className="space-y-6">
                {tournamentNames.map(tournamentName => (
                    <div key={tournamentName}>
                        <h3 className="font-semibold text-lg text-amber-400 flex items-center gap-2">
                           <i data-lucide="trophy" className="w-5 h-5"></i>
                           {tournamentName}
                        </h3>
                        <ul className="mt-2 space-y-3 pl-2 border-l-2 border-gray-700">
                            {tournaments[tournamentName].map(team => (
                                <li key={team.id} className="flex justify-between items-center text-sm ml-4">
                                    <div>
                                        <p className="font-semibold text-text-primary">{team.name}</p>
                                        <p className="text-xs text-text-secondary">{team.mainCategory} - {team.subCategory}</p>
                                    </div>
                                    {team.tournamentPosition && (
                                        <span className="text-xs font-bold bg-yellow-600 text-white px-2 py-1 rounded-full whitespace-nowrap">
                                            {team.tournamentPosition}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default TournamentOverview;
