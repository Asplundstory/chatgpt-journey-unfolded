import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  ChevronUp, 
  ChevronDown, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  MapPin, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  ShoppingCart 
} from "lucide-react";
import { Wine } from "@/hooks/useWines";

export type SortField = 'name' | 'country' | 'region' | 'vintage' | 'category' | 'assortment' | 'price' | 'investment_score' | 'projected_return_1y';
export type SortDirection = 'asc' | 'desc' | null;

interface WineTableProps {
  wines: Wine[];
  onSort: (field: SortField, direction: SortDirection) => void;
  sortField: SortField | null;
  sortDirection: SortDirection;
}

export const WineTable = ({ wines, onSort, sortField, sortDirection }: WineTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (wineId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(wineId)) {
      newExpanded.delete(wineId);
    } else {
      newExpanded.add(wineId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'desc';
    
    if (sortField === field) {
      if (sortDirection === 'desc') {
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        newDirection = null;
      }
    }
    
    onSort(field, newDirection);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    
    if (sortDirection === 'desc') {
      return <ArrowDown className="h-4 w-4" />;
    } else if (sortDirection === 'asc') {
      return <ArrowUp className="h-4 w-4" />;
    }
    
    return <ArrowUpDown className="h-4 w-4" />;
  };

  if (wines.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Inga viner matchade dina sökkriterier.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed w-full">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[24%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[8%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('name')}
                >
                  Namn {getSortIcon('name')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('country')}
                >
                  Land {getSortIcon('country')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('region')}
                >
                  Region {getSortIcon('region')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('vintage')}
                >
                  Årgång {getSortIcon('vintage')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('category')}
                >
                  Kategori {getSortIcon('category')}
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-start w-full"
                  onClick={() => handleSort('assortment')}
                >
                  Sortiment {getSortIcon('assortment')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-end w-full"
                  onClick={() => handleSort('price')}
                >
                  Pris {getSortIcon('price')}
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button 
                  variant="ghost" 
                  className="h-auto p-0 font-semibold justify-end w-full"
                  onClick={() => handleSort('investment_score')}
                >
                  Investering {getSortIcon('investment_score')}
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wines.map((wine) => (
              <Collapsible key={wine.id} open={expandedRows.has(wine.id)} onOpenChange={() => toggleRow(wine.id)}>
                <CollapsibleTrigger asChild>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      {expandedRows.has(wine.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{wine.name}</div>
                        <div className="text-sm text-muted-foreground">{wine.producer}</div>
                      </div>
                    </TableCell>
                    <TableCell>{wine.country || 'N/A'}</TableCell>
                    <TableCell>{wine.region || 'N/A'}</TableCell>
                    <TableCell>{wine.vintage || 'N/A'}</TableCell>
                    <TableCell>
                      {wine.category && (
                        <Badge variant="secondary" className="text-xs">
                          {wine.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {wine.assortment && (
                        <Badge variant={wine.assortment === 'Kommande lansering' ? 'default' : 'outline'} className="text-xs">
                          {wine.assortment}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {wine.price} kr
                    </TableCell>
                    <TableCell className="text-right">
                      {wine.investment_score && (
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="font-medium text-primary">
                            {wine.investment_score}/10
                          </span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                </CollapsibleTrigger>
                
                <CollapsibleContent asChild>
                  <TableRow>
                    <TableCell colSpan={9} className="p-6 bg-muted/20">
                      <div className="space-y-4">
                        {/* Basic Wine Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>{wine.alcohol_percentage}%</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Drick: {wine.drinking_window_start || 'N/A'}-{wine.drinking_window_end || 'N/A'}</span>
                          </div>
                          {wine.sales_start_date && (
                            <div className="flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              <span>Säljstart: {new Date(wine.sales_start_date).toLocaleDateString('sv-SE')}</span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        {wine.description && (
                          <p className="text-sm text-muted-foreground">
                            {wine.description}
                          </p>
                        )}

                        {/* Investment Information */}
                        <div className="flex flex-col lg:flex-row gap-4">
                          <div className="flex-1">
                            {wine.value_appreciation && (
                              <div className="text-xs text-green-600 font-medium mb-2">
                                +{wine.value_appreciation.toFixed(1)}% värdeökning senaste året
                              </div>
                            )}
                            
                            <div className="text-right lg:text-left">
                              <div className="text-xs text-muted-foreground">Rekommenderad lagring</div>
                              <div className="text-sm font-medium">
                                {wine.storage_time_months ? Math.round(wine.storage_time_months / 12) : 0} år
                              </div>
                            </div>
                          </div>

                          {/* Projected Returns Grid */}
                          <div className="lg:w-80">
                            <div className="grid grid-cols-4 gap-2 p-3 bg-accent/20 rounded-md">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">1år</div>
                                <div className="text-sm font-semibold text-primary">
                                  {wine.projected_return_1y && wine.projected_return_1y > 0 ? '+' : ''}{wine.projected_return_1y?.toFixed(1) || '0.0'}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">3år</div>
                                <div className="text-sm font-semibold text-primary">
                                  {wine.projected_return_3y && wine.projected_return_3y > 0 ? '+' : ''}{wine.projected_return_3y?.toFixed(1) || '0.0'}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">5år</div>
                                <div className="text-sm font-semibold text-primary">
                                  {wine.projected_return_5y && wine.projected_return_5y > 0 ? '+' : ''}{wine.projected_return_5y?.toFixed(1) || '0.0'}%
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">10år</div>
                                <div className="text-sm font-semibold text-primary">
                                  {wine.projected_return_10y && wine.projected_return_10y > 0 ? '+' : ''}{wine.projected_return_10y?.toFixed(1) || '0.0'}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};