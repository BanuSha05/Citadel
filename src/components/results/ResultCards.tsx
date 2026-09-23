import React, { useMemo } from 'react';
import { Thermometer, Sun, Wind } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ThermalSimulationResult } from '../../engine/thermal';

interface ResultCardsProps {
  simulationResult: ThermalSimulationResult;
}

export function ResultCards({ simulationResult }: ResultCardsProps) {
  const chartData = useMemo(() => {
    return simulationResult.hourly.map(d => ({
      hour: `${d.hour}:00`,
      outdoorTemp: d.outdoorTemp,
      indoorTemp: d.indoorTemp
    }));
  }, [simulationResult]);

  // Aggregate values
  const peakSolar = Math.max(...simulationResult.hourly.map(h => h.solarGain));
  
  // Calculate total net heat flow for the day (absolute value to show activity)
  let totalHeatGained = 0;
  let totalHeatLost = 0;
  simulationResult.hourly.forEach(h => {
    if (h.netHeatFlow > 0) totalHeatGained += h.netHeatFlow;
    else totalHeatLost -= h.netHeatFlow;
  });

  return (
    <div className="result-cards-container">
      {/* 1. Indoor Temperature */}
      <div className="result-card glass-panel animation-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="card-header">
          <Thermometer className="card-icon-small" />
          <h4>Indoor Temperature</h4>
          <span className="card-value-small">{simulationResult.avgTemp}°C Avg</span>
        </div>
        <div className="chart-placeholder" style={{ height: '150px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIndoor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: 'var(--color-text)' }}
              />
              <Area type="monotone" dataKey="outdoorTemp" name="Outdoor" stroke="var(--color-text-muted)" fill="none" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="indoorTemp" name="Indoor" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorIndoor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Sunlight & Heat */}
      <div className="result-card glass-panel animation-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="card-header">
          <Sun className="card-icon-small" />
          <h4>Solar Thermal Energy</h4>
          <span className="card-value-small">{peakSolar}W Peak</span>
        </div>
        <div className="chart-placeholder flex-center">
          <div className="sunlight-viz">
            <Sun size={48} className="sun-icon bounce" style={{ opacity: peakSolar > 0 ? 1 : 0.3 }} />
            <div className="shelter-shape"></div>
            {peakSolar > 0 && (
              <div className="rays">
                <div className="ray r1"></div>
                <div className="ray r2"></div>
                <div className="ray r3"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Heat Flow */}
      <div className="result-card glass-panel animation-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <Wind className="card-icon-small" />
          <h4>Heat Flow</h4>
          <span className="card-value-small">Daily Net</span>
        </div>
        <div className="chart-placeholder flex-center" style={{ flexDirection: 'column' }}>
          <div className="heat-flow-viz">
            <div className={`arrows-up ${totalHeatLost > totalHeatGained ? 'losing-heat' : ''}`}>
              <span className="arrow">{totalHeatLost > totalHeatGained ? '↓' : '↑'}</span>
              <span className="arrow delay-1">{totalHeatLost > totalHeatGained ? '↓' : '↑'}</span>
              <span className="arrow delay-2">{totalHeatLost > totalHeatGained ? '↓' : '↑'}</span>
            </div>
            <div className={`shelter-shape ${totalHeatLost > totalHeatGained ? 'blue-tint' : 'red-tint'}`}></div>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
            Gained: {Math.round(totalHeatGained / 1000)} kWh | Lost: {Math.round(totalHeatLost / 1000)} kWh
          </div>
        </div>
      </div>
    </div>
  );
}
