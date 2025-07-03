

import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useClub } from '../../context/ClubContext';
import { MainCategory, SubCategory, Player, Team, PlayerStats } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const subCategoryOptions: Record<MainCategory, SubCategory[]> = {
  [MainCategory.Femenino]: [SubCategory.Intermedio],
  [MainCategory.Mixto]: [SubCategory.Avanzado, SubCategory.Intermedio, SubCategory.Basico],
  [MainCategory.Masculino]: [SubCategory.Avanzado, SubCategory.Intermedio],
};

const getLatestStats = (player: Player): PlayerStats => {
    if (!player.statsHistory || player.statsHistory.length === 0) {
        return { attack: 0, defense: 0, block: 0, pass: 0 };
    }
    return [...player.statsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].stats;
};

const CreateTeamForm: React.FC<{ onTeamCreated: () => void }> = ({ onTeamCreated }) => {
  const { players, teams, createTeam, attendances } = useData();
  const { showToast } = useToast();
  const { clubSettings } = useClub();
  const [teamName, setTeamName] = useState('');
  const [tournament, setTournament] = useState('');
  const [mainCategory, setMainCategory] = useState<MainCategory>(MainCategory.Masculino);
  const [subCategory, setSubCategory] = useState<SubCategory>(SubCategory.Avanzado);
  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>(subCategoryOptions[mainCategory]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const options = subCategoryOptions[mainCategory];
    setAvailableSubCategories(options);
    if (!options.includes(subCategory)) {
        setSubCategory(options[0]);
    }
  }, [mainCategory, subCategory]);


  const availablePlayers = useMemo(() => {
    const attendanceCounts = attendances.reduce((acc, curr) => {
        if (curr.status === 'Presente') {
            acc[curr.playerId] = (acc[curr.playerId] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    return players
      .filter(player => {
        const isOnTeamInThisCategory = teams.some(team => 
          team.mainCategory === mainCategory && team.playerIds.includes(player.id)
        );
        const hasMainCategory = player.mainCategories.includes(mainCategory);
        return !isOnTeamInThisCategory && hasMainCategory;
      })
      .map(player => {
        const stats = getLatestStats(player);
        const totalScore = stats.attack + stats.defense + stats.block + stats.pass;
        return { ...player, totalScore };
      })
      .sort((a, b) => {
        const countA = attendanceCounts[a.id] || 0;
        const countB = attendanceCounts[b.id] || 0;
        return countB - countA;
      });
  }, [players, teams, mainCategory, attendances]);
  
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId) ? prev.filter(id => id !== playerId) : [...prev, playerId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
        setError('El nombre del equipo es obligatorio.');
        return;
    }
     if (selectedPlayerIds.length < 6 || selectedPlayerIds.length > 14) {
        setError('Un equipo debe tener entre 6 y 14 jugadores.');
        return;
    }
    setError('');

    try {
        await createTeam({
            name: teamName,
            mainCategory,
            subCategory,
            playerIds: selectedPlayerIds,
            tournament: tournament || undefined
        });
        showToast('¡Equipo creado exitosamente!', 'success');
        setTeamName('');
        setTournament('');
        setSelectedPlayerIds([]);
        onTeamCreated();
    } catch(err) {
        showToast('No se pudo crear el equipo.', 'error');
    }
  };

  if (!clubSettings.teamCreationEnabled) {
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Crear Nuevo Equipo</h3>
            <div className="text-center p-4 bg-gray-800 rounded-md">
                <i data-lucide="lock" className="w-8 h-8 mx-auto text-text-secondary mb-2"></i>
                <p className="text-text-secondary">La creación de equipos está deshabilitada por el administrador.</p>
            </div>
        </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-xl font-bold mb-4">Crear Nuevo Equipo</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre del Equipo" value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" required />
        <input type="text" placeholder="Nombre del Torneo (Opcional)" value={tournament} onChange={e => setTournament(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select value={mainCategory} onChange={e => {
              setMainCategory(e.target.value as MainCategory);
              setSelectedPlayerIds([]);
          }} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
            {Object.values(MainCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select value={subCategory} onChange={e => setSubCategory(e.target.value as SubCategory)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
            {availableSubCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <div className="flex justify-between items-center">
            <h4 className="font-semibold mb-2">Seleccionar Jugadores</h4>
            <span className="text-sm text-text-secondary">{selectedPlayerIds.length} / 14</span>
          </div>
          <p className="text-xs text-text-secondary mb-2">Ordenados por asistencia. Mínimo 6 jugadores.</p>
          <div className="max-h-60 overflow-y-auto bg-gray-800 p-2 rounded-md border border-gray-600 space-y-2">
            {availablePlayers.map(player => (
              <label key={player.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                <input type="checkbox" checked={selectedPlayerIds.includes(player.id)} onChange={() => handlePlayerToggle(player.id)} className="form-checkbox h-5 w-5 bg-gray-900 border-gray-500 text-primary focus:ring-primary"/>
                <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full" />
                <div className="flex-grow flex justify-between items-center text-sm">
                    <span>{player.name}</span>
                    <span className="text-xs text-text-secondary mr-2">{player.position} / Pts: {player.totalScore}</span>
                </div>
              </label>
            ))}
            {availablePlayers.length === 0 && <p className="text-sm text-text-secondary p-2">No hay jugadores disponibles para esta categoría.</p>}
          </div>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" className="w-full">Crear Equipo</Button>
      </form>
    </Card>
  );
};

const EditTeamModal: React.FC<{ team: Team; allPlayers: Player[]; allTeams: Team[]; onClose: () => void; onSave: (team: Team) => void; }> = ({ team, allPlayers, allTeams, onClose, onSave }) => {
    const [position, setPosition] = useState(team.tournamentPosition || '');
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(team.playerIds);
    const [error, setError] = useState('');
    
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const availablePlayers = useMemo(() => {
      return allPlayers
        .filter(player => {
            const hasCorrectMainCategory = player.mainCategories.includes(team.mainCategory);
            if (!hasCorrectMainCategory) return false;

            // Check if player is on another team in the same category
            const isOnAnotherTeam = allTeams.some(
                t => t.id !== team.id &&
                     t.mainCategory === team.mainCategory &&
                     t.playerIds.includes(player.id)
            );
            return !isOnAnotherTeam;
        })
        .map(player => ({ ...player, totalScore: getLatestStats(player).attack + getLatestStats(player).defense + getLatestStats(player).block + getLatestStats(player).pass }))
        .sort((a, b) => b.totalScore - a.totalScore);
    }, [allPlayers, allTeams, team]);

    const handlePlayerToggle = (playerId: string) => {
        setSelectedPlayerIds(prev => 
            prev.includes(playerId) 
            ? prev.filter(id => id !== playerId) 
            : [...prev, playerId]
        );
    };

    const handleSave = () => {
        if (selectedPlayerIds.length < 6 || selectedPlayerIds.length > 14) {
            setError('El equipo debe tener entre 6 y 14 jugadores.');
            return;
        }
        setError('');
        onSave({ ...team, tournamentPosition: position, playerIds: selectedPlayerIds });
    };

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="edit-team-title" className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 id="edit-team-title" className="text-xl font-bold mb-4 text-primary">Editar Equipo: {team.name}</h3>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="position" className="block text-sm font-medium text-text-secondary mb-1">Posición en el Torneo</label>
                        <input
                            id="position"
                            type="text"
                            placeholder="Ej: Campeón, 3er Lugar"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-text-secondary">Miembros del Equipo</label>
                        <span className="text-sm font-semibold text-text-primary">{selectedPlayerIds.length} / 14</span>
                      </div>
                      <div className="max-h-60 overflow-y-auto bg-gray-800 p-2 rounded-md border border-gray-600 space-y-2">
                          {availablePlayers.map(player => (
                              <label key={player.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700 cursor-pointer">
                                  <input type="checkbox" checked={selectedPlayerIds.includes(player.id)} onChange={() => handlePlayerToggle(player.id)} className="form-checkbox h-5 w-5 bg-gray-900 border-gray-500 text-primary focus:ring-primary"/>
                                  <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full" />
                                  <span className="text-sm">{player.name}</span>
                              </label>
                          ))}
                          {availablePlayers.length === 0 && <p className="text-sm text-text-secondary p-2">No hay jugadores disponibles.</p>}
                      </div>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

                <div className="mt-6 flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSave}>Guardar Cambios</Button>
                </div>
            </div>
        </div>
    );
};

const Teams: React.FC = () => {
    const { teams, players, loading, updateTeam } = useData();
    const { clubSettings, loading: clubLoading } = useClub();
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const { showToast } = useToast();
    const [renderTrigger, setRenderTrigger] = useState(0);

    const initialOpenState = useMemo(() => Object.values(SubCategory).reduce((acc, cat) => ({ ...acc, [cat]: true }), {}), []);
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(initialOpenState);

    useEffect(() => {
        if (typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }, [teams, editingTeam, openSections, clubSettings]);

    const handleSaveTeam = async (updatedTeam: Team) => {
        try {
            await updateTeam(updatedTeam);
            showToast('Equipo actualizado con éxito.', 'success');
        } catch (error) {
            showToast('Error al actualizar el equipo.', 'error');
        }
        setEditingTeam(null);
    };

    const teamsBySubCategory = useMemo(() => {
      const grouped: Record<string, Team[]> = {};
      teams.forEach(team => {
        if (!grouped[team.subCategory]) {
          grouped[team.subCategory] = [];
        }
        grouped[team.subCategory].push(team);
      });
      Object.values(grouped).forEach(teamList => teamList.sort((a,b) => a.name.localeCompare(b.name)));
      return grouped;
    }, [teams]);
    
    const sortedSubCategories = useMemo(() => {
      const order = [SubCategory.Avanzado, SubCategory.Intermedio, SubCategory.Basico];
      return Object.keys(teamsBySubCategory).sort((a, b) => order.indexOf(a as SubCategory) - order.indexOf(b as SubCategory));
    }, [teamsBySubCategory]);

    const handleToggleSection = (subCategory: string) => {
        setOpenSections(prev => ({ ...prev, [subCategory]: !prev[subCategory] }));
    };

    const getPlayerById = (id: string): Player | undefined => players.find(p => p.id === id);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-3xl font-bold">Equipos Existentes</h2>
                    {loading && <p>Cargando equipos...</p>}
                    {!loading && sortedSubCategories.map(subCategory => (
                      <div key={subCategory}>
                        <h3 onClick={() => handleToggleSection(subCategory)} className="text-2xl font-semibold text-text-primary mb-4 pb-2 border-b-2 border-primary/50 flex justify-between items-center cursor-pointer">
                            <span>{subCategory}</span>
                            <i data-lucide={openSections[subCategory] ? 'chevron-down' : 'chevron-right'} className="w-7 h-7 transition-transform"></i>
                        </h3>
                        {openSections[subCategory] && (
                            <div className="space-y-4 animate-fade-in">
                                {teamsBySubCategory[subCategory].map(team => (
                                    <Card key={team.id}>
                                        <div className="flex justify-between items-start gap-4">
                                           <div>
                                                <h4 className="text-xl font-bold text-primary">{team.name}</h4>
                                                <p className="text-text-secondary">{team.mainCategory}</p>
                                                {team.tournament && <p className="text-sm text-amber-400 mt-1 flex items-center gap-1.5"><i data-lucide="trophy" className="w-4 h-4"></i>{team.tournament}</p>}
                                           </div>
                                           <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                              <span className="text-sm bg-primary text-white px-3 py-1 rounded-full">{team.playerIds.length} Jugadores</span>
                                              {team.tournamentPosition && <span className="text-xs font-bold bg-yellow-600 text-white px-2 py-1 rounded-full">{team.tournamentPosition}</span>}
                                           </div>
                                        </div>
                                        <div className="mt-4 border-t border-gray-700 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex flex-wrap gap-2">
                                                {team.playerIds.slice(0, 12).map(id => getPlayerById(id)).filter(p => p).map(player => (
                                                    <div key={player!.id} title={player!.name}>
                                                      <Link to={`/player/${player!.id}`}>
                                                        <img src={player!.avatarUrl} alt={player!.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 hover:border-primary transition-colors"/>
                                                      </Link>
                                                    </div>
                                                ))}
                                                {team.playerIds.length > 12 && <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-text-secondary">+{team.playerIds.length-12}</div>}
                                                {team.playerIds.length === 0 && <p className="text-sm text-text-secondary">Este equipo no tiene miembros.</p>}
                                            </div>
                                            <Button variant="secondary" onClick={() => setEditingTeam(team)} className="w-full sm:w-auto flex-shrink-0">
                                                <i data-lucide="edit-3" className="w-4 h-4 mr-2"></i> Editar Equipo
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                      </div>
                    ))}
                    {!loading && teams.length === 0 && <Card><p>No hay equipos creados.</p></Card>}
                </div>
                <div className="lg:sticky top-6">
                    {clubLoading ? <Card><p>Cargando...</p></Card> : <CreateTeamForm onTeamCreated={() => setRenderTrigger(c => c + 1)} />}
                </div>
            </div>
            {editingTeam && (
                <EditTeamModal 
                    team={editingTeam}
                    allPlayers={players}
                    allTeams={teams}
                    onClose={() => setEditingTeam(null)}
                    onSave={handleSaveTeam}
                />
            )}
        </>
    );
};

export default Teams;
