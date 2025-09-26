import { useState, useEffect } from 'react';

export interface LaunchPlan {
  title: string;
  date: string;
  url: string;
  year: number;
  quarter?: string;
}

export const useLaunchPlans = () => {
  const [launchPlans, setLaunchPlans] = useState<LaunchPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLaunchPlans = async () => {
      try {
        setLoading(true);
        
        // Statiska lanseringsplaner baserat på scrapade data
        const plans: LaunchPlan[] = [
          // 2026
          {
            title: "Lanseringsplan juni 2026",
            date: "2026-06",
            url: "https://cms-cdn.systembolaget.se/49d3ee/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-juni-2026.xlsx",
            year: 2026,
            quarter: "Q2"
          },
          {
            title: "Lanseringsplan mars 2026",
            date: "2026-03",
            url: "https://cms-cdn.systembolaget.se/4965e9/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-mars-2026.xlsx",
            year: 2026,
            quarter: "Q1"
          },
          // 2025
          {
            title: "Lanseringsplan december 2025",
            date: "2025-12",
            url: "https://cms-cdn.systembolaget.se/48de5f/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-december-2025.xlsx",
            year: 2025,
            quarter: "Q4"
          },
          {
            title: "Lanseringsplan september 2025",
            date: "2025-09",
            url: "https://cms-cdn.systembolaget.se/4a9966/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-september-2025.xlsx",
            year: 2025,
            quarter: "Q3"
          },
          {
            title: "Lanseringsplan juni 2025",
            date: "2025-06",
            url: "https://cms-cdn.systembolaget.se/49d851/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-juni-2025.xlsx",
            year: 2025,
            quarter: "Q2"
          },
          {
            title: "Lanseringsplan mars 2025",
            date: "2025-03",
            url: "https://cms-cdn.systembolaget.se/496123/globalassets/nytt/om-vara-nyheter/lanseringsplaner/excel-och-pdf/lanseringsplan-mars-2025.xlsx",
            year: 2025,
            quarter: "Q1"
          }
        ];

        // Sortera efter datum (nyast först)
        const sortedPlans = plans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        setLaunchPlans(sortedPlans);
        
      } catch (err) {
        console.error('Error fetching launch plans:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch launch plans');
      } finally {
        setLoading(false);
      }
    };

    fetchLaunchPlans();
  }, []);

  return { launchPlans, loading, error };
};