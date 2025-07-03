
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { MainCategory, SubCategory } from '../../types';
import Card from '../ui/Card';

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 'N/A';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const AllAthletesTable: React.FC = () => {
  const { players, loading } = useData();
  const [mainCategoryFilter, setMainCategoryFilter] = useState<string>('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('All');

  useEffect(() => {
    if (typeof (window as any).lucide !== 'undefined') {
        (window as any).lucide.createIcons();
    }
  }, [players]);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const mainCatMatch = mainCategoryFilter === 'All' || player.mainCategories.includes(mainCategoryFilter as MainCategory);
      const subCatMatch = subCategoryFilter === 'All' || player.subCategory === subCategoryFilter;
      return mainCatMatch && subCatMatch;
    });
  }, [players, mainCategoryFilter, subCategoryFilter]);
  
  const FilterControls = () => (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-text-primary whitespace-nowrap">Listado General de Atletas</h2>
        <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-text-secondary">Filtros:</span>
            <div>
                <label htmlFor="mainCategoryFilterTable" className="sr-only">Categoría</label>
                <select
                id="mainCategoryFilterTable"
                value={mainCategoryFilter}
                onChange={(e) => setMainCategoryFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                <option value="All">Todas las Categorías</option>
                {Object.values(MainCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="subCategoryFilterTable" className="sr-only">Nivel</label>
                <select
                id="subCategoryFilterTable"
                value={subCategoryFilter}
                onChange={(e) => setSubCategoryFilter(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                <option value="All">Todos los Niveles</option>
                {Object.values(SubCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
        </div>
    </div>
  );

  return (
    <Card className="!p-0">
      <FilterControls />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm text-left">
          <thead className="bg-surface text-xs text-text-secondary uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Jugador</th>
              <th scope="col" className="px-6 py-3">Edad</th>
              <th scope="col" className="px-6 py-3">Categoría</th>
              <th scope="col" className="px-6 py-3">Nivel</th>
              <th scope="col" className="px-6 py-3">Posición</th>
              <th scope="col" className="px-6 py-3">Documento</th>
              <th scope="col" className="px-6 py-3">Teléfono</th>
              <th scope="col" className="px-6 py-3">Dirección</th>
              <th scope="col" className="px-6 py-3">Fecha de Ingreso</th>
              <th scope="col" className="px-6 py-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
                <tr><td colSpan={10} className="text-center py-8 text-text-secondary">Cargando atletas...</td></tr>
            ) : filteredPlayers.length > 0 ? (
              filteredPlayers.map(player => (
                <tr key={player.id} className="hover:bg-gray-800/60 transition-colors">
                  <th scope="row" className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                    <Link to={`/player/${player.id}`} className="flex items-center gap-3 group">
                        <img className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-primary transition-colors" src={player.avatarUrl} alt={player.name} />
                        <span className="group-hover:text-primary transition-colors">{player.name}</span>
                    </Link>
                  </th>
                  <td className="px-6 py-4">{calculateAge(player.birthDate)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                        {player.mainCategories.map(cat => (
                            <span key={cat} className="text-xs bg-gray-600 text-text-primary px-2 py-0.5 rounded-full w-fit">{cat}</span>
                        ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">{player.subCategory}</td>
                  <td className="px-6 py-4">{player.position}</td>
                  <td className="px-6 py-4">{player.document}</td>
                  <td className="px-6 py-4">{player.phone}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={player.address}>{player.address}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(player.joinDate).toLocaleDateString('es-ES')}</td>
                  <td className="px-6 py-4 text-center">
                     <Link to={`/player/${player.id}`} className="font-medium text-primary hover:underline">Ver Perfil</Link>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={10} className="text-center py-8 text-text-secondary">No se encontraron jugadores con los filtros seleccionados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AllAthletesTable;
