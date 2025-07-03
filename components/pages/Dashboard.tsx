
import React from 'react';
import NewAthletesChart from '../dashboard/NewAthletesChart';
import TopAthletesList from '../dashboard/TopAthletesList';
import DashboardSummary from '../dashboard/DashboardSummary';
import TournamentOverview from '../dashboard/TournamentOverview';
import OverduePayments from '../dashboard/OverduePayments';
import { useClub } from '../../context/ClubContext';
import { useData } from '../../context/DataContext';
import AllAthletesTable from '../dashboard/AllAthletesTable';

const Dashboard: React.FC = () => {
  const { clubSettings } = useClub();
  const { teams, loading: dataLoading } = useData();

  const hasTournaments = !dataLoading && teams.some(team => !!team.tournament);
  
  return (
    <div className="space-y-6">
      <DashboardSummary />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main chart takes up more space */}
        <div className="lg:col-span-3">
          <NewAthletesChart />
        </div>

        {/* Right column for smaller cards */}
        <div className="lg:col-span-2">
          {hasTournaments ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 h-full">
              <TopAthletesList />
              <TournamentOverview />
            </div>
          ) : (
            <TopAthletesList />
          )}
        </div>
      </div>

      <AllAthletesTable />
      
      {clubSettings.monthlyPaymentEnabled && <OverduePayments />}
    </div>
  );
};

export default Dashboard;
