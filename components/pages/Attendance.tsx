import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MainCategory, SubCategory, Attendance as AttendanceType } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Attendance: React.FC = () => {
  const { players, loading, attendances, recordAttendance } = useData();
  const { showToast } = useToast();
  const [mainCategoryFilter, setMainCategoryFilter] = useState<string>('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('All');

  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const mainCatMatch = mainCategoryFilter === 'All' || player.mainCategories.includes(mainCategoryFilter as MainCategory);
      const subCatMatch = subCategoryFilter === 'All' || player.subCategory === subCategoryFilter;
      return mainCatMatch && subCatMatch;
    });
  }, [players, mainCategoryFilter, subCategoryFilter]);
  
  const getAttendanceStatus = (playerId: string): AttendanceType['status'] | 'Pending' => {
    const record = attendances.find(a => a.playerId === playerId && a.date === today);
    return record ? record.status : 'Pending';
  };

  const handleSetAttendance = (playerId: string, playerName: string, status: AttendanceType['status']) => {
    recordAttendance({playerId, status});
    showToast(`${playerName} marcado como ${status.toLowerCase()}`, 'success');
  }

  const FilterControls = () => (
    <div className="bg-gray-900/70 backdrop-blur-md border border-gray-800 p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
      <span className="font-bold">Filtros:</span>
      <div>
        <label htmlFor="mainCategory" className="text-sm text-text-secondary mr-2">Categoría Principal:</label>
        <select
          id="mainCategory"
          value={mainCategoryFilter}
          onChange={(e) => setMainCategoryFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">Todas</option>
          {Object.values(MainCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="subCategory" className="text-sm text-text-secondary mr-2">Nivel:</label>
        <select
          id="subCategory"
          value={subCategoryFilter}
          onChange={(e) => setSubCategoryFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="All">Todos</option>
          {Object.values(SubCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <p className="text-sm text-text-secondary ml-auto">Asistencia para hoy: {new Date(today).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <FilterControls />
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : (
        <Card>
            <ul className="divide-y divide-gray-700">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => {
                        const status = getAttendanceStatus(player.id);
                        return (
                            <li key={player.id} className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                                <div className="flex items-center gap-4">
                                    <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <Link to={`/player/${player.id}`} className="font-bold text-lg text-text-primary hover:text-primary transition-colors">{player.name}</Link>
                                        <p className="text-sm text-text-secondary">{player.position}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-56 sm:justify-end">
                                    {status === 'Pending' ? (
                                        <>
                                            <Button onClick={() => handleSetAttendance(player.id, player.name, 'Presente')} className="flex-1 sm:flex-initial sm:w-28">
                                                Presente
                                            </Button>
                                            <Button onClick={() => handleSetAttendance(player.id, player.name, 'Ausente')} variant="secondary" className="flex-1 sm:flex-initial sm:w-28">
                                                Ausente
                                            </Button>
                                        </>
                                    ) : (
                                        <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                                            status === 'Presente' 
                                                ? 'bg-green-500/20 text-green-300' 
                                                : 'bg-yellow-500/20 text-yellow-300'
                                            }`}
                                        >
                                            {status}
                                        </span>
                                    )}
                                </div>
                            </li>
                        )
                    })
                ) : (
                    <p className="col-span-full text-center text-text-secondary p-4">No se encontraron jugadores con los filtros seleccionados.</p>
                )}
            </ul>
        </Card>
      )}
    </div>
  );
};

export default Attendance;