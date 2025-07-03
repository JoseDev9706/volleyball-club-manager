
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { MainCategory, SubCategory } from '../../types';
import PlayerCard from '../shared/PlayerCard';

const Categories: React.FC = () => {
  const { players, loading } = useData();
  const [mainCategoryFilter, setMainCategoryFilter] = useState<string>(MainCategory.Femenino);
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>(SubCategory.Avanzado);

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const mainCatMatch = mainCategoryFilter === 'All' || player.mainCategories.includes(mainCategoryFilter as MainCategory);
      const subCatMatch = subCategoryFilter === 'All' || player.subCategory === subCategoryFilter;
      return mainCatMatch && subCatMatch;
    });
  }, [players, mainCategoryFilter, subCategoryFilter]);

  const FilterControls = () => (
    <div className="bg-surface p-4 rounded-lg mb-6 flex flex-wrap items-center gap-4">
      <span className="font-bold">Ver jugadores en:</span>
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
    </div>
  );

  return (
    <div className="space-y-6">
      <FilterControls />
      {loading ? (
        <p>Cargando jugadores...</p>
      ) : (
        <>
            <h2 className="text-2xl font-bold">
                {mainCategoryFilter === 'All' ? 'Todas las categorías' : mainCategoryFilter} - {subCategoryFilter === 'All' ? 'Todos los niveles' : subCategoryFilter}
                <span className="text-lg font-normal text-text-secondary ml-2">({filteredPlayers.length} jugadores)</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => <PlayerCard key={player.id} player={player} />)
                ) : (
                    <p className="col-span-full text-center text-text-secondary">No hay jugadores en esta categoría.</p>
                )}
            </div>
        </>
      )}
    </div>
  );
};

export default Categories;
