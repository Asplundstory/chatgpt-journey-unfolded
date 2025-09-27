import { Wine } from './useWines';
import { WineList } from './useWineLists';

export const useWineExport = () => {

  const exportToCSV = (wines: Wine[], filename: string = 'wine-list') => {
    const headers = [
      'Namn',
      'Producent', 
      'Land',
      'Region',
      'Årgång',
      'Kategori',
      'Pris (kr)',
      'Alkoholhalt (%)',
      'Investeringsbetyg',
      'Förväntad avkastning 1år (%)',
      'Förväntad avkastning 3år (%)',
      'Förväntad avkastning 5år (%)',
      'Förväntad avkastning 10år (%)',
      'Beskrivning'
    ];

    const csvContent = [
      headers.join(','),
      ...wines.map(wine => [
        `"${wine.name || ''}"`,
        `"${wine.producer || ''}"`,
        `"${wine.country || ''}"`,
        `"${wine.region || ''}"`,
        wine.vintage || '',
        `"${wine.category || ''}"`,
        wine.price || '',
        wine.alcohol_percentage || '',
        wine.investment_score || '',
        wine.projected_return_1y || '',
        wine.projected_return_3y || '',
        wine.projected_return_5y || '',
        wine.projected_return_10y || '',
        `"${wine.description?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = (wines: Wine[], filename: string = 'wine-list') => {
    const jsonContent = JSON.stringify(wines, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportListToJSON = (list: WineList, wines: Wine[]) => {
    const listWines = wines.filter(wine => list.wines.includes(wine.id));
    const exportData = {
      list: {
        name: list.name,
        description: list.description,
        created_at: list.created_at,
        wine_count: listWines.length
      },
      wines: listWines
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    exportToCSV,
    exportToJSON,
    exportListToJSON
  };
};