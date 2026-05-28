import React from 'react';
import LeadsTable from '@/components/growth/leads-table';
import FunnelChart from '@/components/growth/funnel-chart';

const GrowthDashboardPage = () => {
    return (
        <div className="bg-[#121212] p-8">
            <h1 className="text-4xl font-bold text-white mb-8">Business Growth Automation Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LeadsTable />
                <FunnelChart />
            </div>
        </div>
    );
};

export default GrowthDashboardPage;
