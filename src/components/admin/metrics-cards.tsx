import React from 'react';

interface Metric {
    id: string | number;
    name: string;
    value: string | number;
    icon?: React.ReactNode;
}

interface MetricsCardsProps {
    metrics: Metric[];
}

const MetricsCards = ({ metrics }: MetricsCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
                <div 
                    key={metric.id} 
                    className="bg-[#1E1E1E] p-4 rounded-lg shadow-md border border-white/10 flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400">{metric.name}</h3>
                        <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                    </div>
                    {metric.icon && (
                        <div className="bg-white/10 p-3 rounded-full text-white">
                            {metric.icon}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MetricsCards;
