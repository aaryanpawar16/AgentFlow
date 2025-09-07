import React, { useEffect, useState } from "react";

interface CalendarResponse {
  status: string;
  subject: string;
  slots: string[];
}

const CalendarSlots: React.FC = () => {
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await fetch("/api/calendar", {
          headers: {
            Authorization: "Bearer demo-token", // replace with real token later
          },
        });

        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch slots");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  if (loading) return <p className="text-gray-400">Loading calendar...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <p className="text-gray-400">No data available</p>;

  return (
    <div className="p-4 bg-gray-800 rounded-xl shadow-md text-white">
      <h2 className="text-xl font-bold mb-2">Available Slots</h2>
      <p className="text-sm text-gray-400 mb-4">User: {data.subject}</p>
      <ul className="space-y-2">
        {data.slots.map((slot) => (
          <li
            key={slot}
            className="px-3 py-2 bg-gray-700 rounded-md hover:bg-gray-600 transition"
          >
            {slot}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalendarSlots;
