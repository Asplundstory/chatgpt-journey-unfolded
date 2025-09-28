import React, { useMemo, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronDown, ChevronRight, ChevronUp, Star, Plus, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { WineFavoriteButton } from '@/components/WineFavoriteButton';
import { useWineLists } from '@/hooks/useWineLists';
import { Wine } from '@/hooks/useWines';
import { toast } from 'sonner';

export type SortField = 'name' | 'country' | 'region' | 'vintage' | 'category' | 'assortment' | 'price' | 'investment_score' | 'projected_return_1y';
export type SortDirection = 'asc' | 'desc' | null;

interface VirtualizedWineTableProps {
  wines: Wine[];
  onSort: (field: SortField, direction: SortDirection) => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
}

export const VirtualizedWineTable = ({ wines, onSort, sortField, sortDirection }: VirtualizedWineTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const { lists: wineLists, addWineToList, createList } = useWineLists();

  const toggleRow = (wineId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(wineId)) {
      newExpandedRows.delete(wineId);
    } else {
      newExpandedRows.add(wineId);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortField === field) {
      if (sortDirection === 'asc') {
        newDirection = 'desc';
      } else if (sortDirection === 'desc') {
        newDirection = null;
      } else {
        newDirection = 'asc';
      }
    }
    
    onSort(field, newDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="h-4 w-4 opacity-50" />;
    }
    
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4" />;
    } else if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4" />;
    }
    
    return <ChevronUp className="h-4 w-4 opacity-50" />;
  };

  const handleAddToList = async (wineId: string, listId?: string) => {
    if (listId) {
      try {
        addWineToList(listId, wineId);
        toast.success('Vin tillagt i listan!');
      } catch (error) {
        console.error('Error adding wine to list:', error);
        toast.error('Kunde inte lägga till vin i listan');
      }
    } else {
      const listName = window.prompt('Ange namn på ny lista:');
      if (listName) {
        try {
          const newList = createList(listName);
          if (newList) {
            setTimeout(() => {
              try {
                addWineToList(newList.id, wineId);
                toast.success(`Vin tillagt i "${listName}"!`);
              } catch (error) {
                console.error('Error adding wine to new list:', error);
                toast.error('Kunde inte lägga till vin i den nya listan');
              }
            }, 100);
          }
        } catch (error) {
          console.error('Error creating wine list:', error);
          toast.error('Kunde inte skapa listan');
        }
      }
    }
  };

  const WineRow = ({ index, wine }: { index: number; wine: Wine }) => {
    const isExpanded = expandedRows.has(wine.id);

    return (
      <Card className="mb-2">
        <Collapsible open={isExpanded} onOpenChange={() => toggleRow(wine.id)}>
          <div className="border-b border-border/50">
            <div className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
              <div className="col-span-4 flex items-center gap-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <div>
                  <p className="font-medium text-foreground truncate">{wine.name}</p>
                  <p className="text-muted-foreground text-xs truncate">{wine.producer}</p>
                </div>
              </div>
              
              <div className="col-span-2">
                <p className="text-foreground">{wine.country}</p>
                <p className="text-muted-foreground text-xs">{wine.region}</p>
              </div>
              
              <div className="col-span-1">
                <Badge variant="outline" className="text-xs">
                  {wine.vintage || 'N/A'}
                </Badge>
              </div>
              
              <div className="col-span-1">
                <Badge variant="secondary" className="text-xs">
                  {wine.category}
                </Badge>
              </div>
              
              <div className="col-span-1">
                <p className="font-medium text-primary">{wine.price} kr</p>
              </div>
              
              <div className="col-span-1">
                {wine.investment_score && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-medium">{wine.investment_score}/10</span>
                  </div>
                )}
              </div>
              
              <div className="col-span-2 flex items-center gap-2 justify-end">
                <WineFavoriteButton wineId={wine.id} />
                
                <div className="relative group">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 bg-popover border border-border rounded-md shadow-lg min-w-[200px]">
                    <div className="p-1">
                      {wineLists.length > 0 && (
                        <>
                          {wineLists.map((list) => (
                            <Button
                              key={list.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs h-8"
                              onClick={() => handleAddToList(wine.id, list.id)}
                            >
                              {list.name}
                            </Button>
                          ))}
                          <div className="border-t border-border my-1" />
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8"
                        onClick={() => handleAddToList(wine.id)}
                      >
                        + Skapa ny lista
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <CollapsibleContent>
            <div className="p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                {wine.description && (
                  <div className="lg:col-span-3">
                    <h4 className="font-medium text-foreground mb-2">Beskrivning</h4>
                    <p className="text-muted-foreground">{wine.description}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">Grundläggande information</h4>
                  <div className="space-y-1">
                    {wine.alcohol_percentage && (
                      <p><span className="text-muted-foreground">Alkoholhalt:</span> {wine.alcohol_percentage}%</p>
                    )}
                    {wine.assortment && (
                      <p><span className="text-muted-foreground">Sortiment:</span> {wine.assortment}</p>
                    )}
                    {wine.sales_start_date && (
                      <p><span className="text-muted-foreground">Lansering:</span> {new Date(wine.sales_start_date).toLocaleDateString('sv-SE')}</p>
                    )}
                  </div>
                </div>
                
                {(wine.drinking_window_start || wine.drinking_window_end || wine.storage_time_months) && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Lagring & Drickning</h4>
                    <div className="space-y-1">
                      {wine.drinking_window_start && wine.drinking_window_end && (
                        <p><span className="text-muted-foreground">Drinkfönster:</span> {wine.drinking_window_start} - {wine.drinking_window_end}</p>
                      )}
                      {wine.storage_time_months && (
                        <p><span className="text-muted-foreground">Lagringstid:</span> {Math.round(wine.storage_time_months / 12)} år</p>
                      )}
                    </div>
                  </div>
                )}
                
                {(wine.investment_score || wine.projected_return_1y || wine.projected_return_3y || wine.projected_return_5y || wine.projected_return_10y) && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Investeringspotential</h4>
                    <div className="space-y-1">
                      {wine.investment_score && (
                        <p><span className="text-muted-foreground">Investeringsbetyg:</span> {wine.investment_score}/10</p>
                      )}
                      {wine.projected_return_1y && (
                        <p><span className="text-muted-foreground">1-års avkastning:</span> {Math.round(wine.projected_return_1y)}%</p>
                      )}
                      {wine.projected_return_3y && (
                        <p><span className="text-muted-foreground">3-års avkastning:</span> {Math.round(wine.projected_return_3y)}%</p>
                      )}
                      {wine.projected_return_5y && (
                        <p><span className="text-muted-foreground">5-års avkastning:</span> {Math.round(wine.projected_return_5y)}%</p>
                      )}
                      {wine.projected_return_10y && (
                        <p><span className="text-muted-foreground">10-års avkastning:</span> {Math.round(wine.projected_return_10y)}%</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const TableHeader = () => (
    <Card className="mb-4">
      <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 text-sm font-medium border-b">
        <div className="col-span-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('name')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Vinets namn
            {getSortIcon('name')}
          </Button>
        </div>
        <div className="col-span-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('country')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Land/Region
            {getSortIcon('country')}
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('vintage')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Årgång
            {getSortIcon('vintage')}
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('category')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Kategori
            {getSortIcon('category')}
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('price')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Pris
            {getSortIcon('price')}
          </Button>
        </div>
        <div className="col-span-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort('investment_score')}
            className="h-auto p-0 font-medium hover:bg-transparent"
          >
            Investeringspotential
            {getSortIcon('investment_score')}
          </Button>
        </div>
        <div className="col-span-2 text-right">Åtgärder</div>
      </div>
    </Card>
  );

  if (wines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Inga viner matchar dina sökkriterier.</p>
        <p className="text-muted-foreground mt-2">Prova att justera dina filter eller rensa sökningen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TableHeader />
      <div style={{ height: '600px' }}>
        <Virtuoso
          data={wines}
          itemContent={(index, wine) => <WineRow index={index} wine={wine} />}
          className="scrollbar-thin scrollbar-thumb-border scrollbar-track-background"
        />
      </div>
    </div>
  );
};