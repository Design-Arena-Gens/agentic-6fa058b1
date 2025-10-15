'use client';

import { useState, useEffect } from 'react';

interface EnergyEntry {
  date: string;
  level: number;
  activities: string[];
  notes: string;
}

export default function Home() {
  const [entries, setEntries] = useState<Record<string, EnergyEntry>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [activities, setActivities] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('energyEntries');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('energyEntries', JSON.stringify(entries));
  }, [entries]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getEnergyColor = (level: number) => {
    if (level <= 3) return 'bg-red-400';
    if (level <= 5) return 'bg-yellow-400';
    if (level <= 7) return 'bg-green-400';
    return 'bg-emerald-500';
  };

  const handleSaveEntry = () => {
    if (!selectedDate) return;

    const entry: EnergyEntry = {
      date: selectedDate,
      level: energyLevel,
      activities: activities.split(',').map(a => a.trim()).filter(a => a),
      notes: notes,
    };

    setEntries(prev => ({
      ...prev,
      [selectedDate]: entry,
    }));

    setActivities('');
    setNotes('');
    setEnergyLevel(5);
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const entry = entries[dateStr];
    if (entry) {
      setEnergyLevel(entry.level);
      setActivities(entry.activities.join(', '));
      setNotes(entry.notes);
    } else {
      setEnergyLevel(5);
      setActivities('');
      setNotes('');
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthStr = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = formatDate(date);
      const entry = entries[dateStr];
      const isSelected = selectedDate === dateStr;
      const isToday = dateStr === formatDate(new Date());

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(dateStr)}
          className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          } ${isToday ? 'border-blue-500 border-2' : 'border-gray-300'}`}
        >
          <div className="flex flex-col h-full">
            <div className="text-sm font-semibold mb-1">{day}</div>
            {entry && (
              <div className="flex-1 flex flex-col gap-1">
                <div className={`h-3 rounded ${getEnergyColor(entry.level)}`} title={`Energy: ${entry.level}/10`}></div>
                {entry.activities.length > 0 && (
                  <div className="text-xs text-gray-600 truncate">{entry.activities[0]}</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            &larr; Prev
          </button>
          <h2 className="text-xl font-bold">{monthStr}</h2>
          <button
            onClick={handleNextMonth}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Next &rarr;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

  const selectedEntry = selectedDate ? entries[selectedDate] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Energy Management Calendar</h1>
          <p className="text-gray-600">Track your daily energy levels and activities</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            {renderCalendar()}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">
              {selectedDate ? `Entry for ${new Date(selectedDate + 'T00:00:00').toLocaleDateString()}` : 'Select a date'}
            </h3>

            {selectedDate && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Energy Level: {energyLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Activities (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                    placeholder="Exercise, Work, Meeting..."
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How did you feel? What affected your energy?"
                    className="w-full border border-gray-300 rounded px-3 py-2 h-24"
                  />
                </div>

                <button
                  onClick={handleSaveEntry}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 font-semibold"
                >
                  Save Entry
                </button>

                {selectedEntry && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-2">Saved Information:</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Energy:</span> {selectedEntry.level}/10
                      </div>
                      {selectedEntry.activities.length > 0 && (
                        <div>
                          <span className="font-medium">Activities:</span>
                          <ul className="list-disc list-inside ml-2">
                            {selectedEntry.activities.map((activity, idx) => (
                              <li key={idx}>{activity}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {selectedEntry.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="ml-2 text-gray-700">{selectedEntry.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedDate && (
              <p className="text-gray-500 text-center py-8">
                Click on a date in the calendar to add or view an energy entry
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Energy Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-red-400"></div>
              <span>Low (1-3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-yellow-400"></div>
              <span>Medium (4-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-green-400"></div>
              <span>Good (6-7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-emerald-500"></div>
              <span>High (8-10)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
