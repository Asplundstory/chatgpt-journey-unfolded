import { useState } from "react";
import { Plus, FolderPlus, Download, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useWineLists } from "@/hooks/useWineLists";
import { useWineExport } from "@/hooks/useWineExport";
import { Wine } from "@/hooks/useWines";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WineListManagerProps {
  wines: Wine[];
}

export const WineListManager = ({ wines }: WineListManagerProps) => {
  const { lists, createList, deleteList, updateList } = useWineLists();
  const { exportListToJSON, exportToCSV } = useWineExport();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] = useState("");

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList(newListName.trim(), newListDescription.trim() || undefined);
      setNewListName("");
      setNewListDescription("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateList = (listId: string) => {
    if (newListName.trim()) {
      updateList(listId, {
        name: newListName.trim(),
        description: newListDescription.trim() || undefined
      });
      setNewListName("");
      setNewListDescription("");
      setEditingList(null);
    }
  };

  const exportList = (listId: string, format: 'csv' | 'json') => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;

    const listWines = wines.filter(wine => list.wines.includes(wine.id));
    
    if (format === 'csv') {
      exportToCSV(listWines, list.name.replace(/[^a-z0-9]/gi, '_').toLowerCase());
    } else {
      exportListToJSON(list, wines);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mina vinlistor</h3>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Ny lista
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skapa ny vinlista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="list-name">Namn</Label>
                <Input
                  id="list-name"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="T.ex. Favoriter, Att köpa..."
                />
              </div>
              <div>
                <Label htmlFor="list-description">Beskrivning (valfri)</Label>
                <Textarea
                  id="list-description"
                  value={newListDescription}
                  onChange={(e) => setNewListDescription(e.target.value)}
                  placeholder="Kort beskrivning av listan..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateList} disabled={!newListName.trim()}>
                  Skapa lista
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Avbryt
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{list.name}</CardTitle>
                  {list.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {list.description}
                    </p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ml-2">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        setEditingList(list.id);
                        setNewListName(list.name);
                        setNewListDescription(list.description || "");
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Redigera
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportList(list.id, 'csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportera CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => exportList(list.id, 'json')}>
                      <Download className="h-4 w-4 mr-2" />
                      Exportera JSON
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteList(list.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Ta bort
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {list.wines.length} viner
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {list.updated_at.toLocaleDateString('sv-SE')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingList} onOpenChange={(open) => !open && setEditingList(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redigera lista</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-list-name">Namn</Label>
              <Input
                id="edit-list-name"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-list-description">Beskrivning</Label>
              <Textarea
                id="edit-list-description"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => editingList && handleUpdateList(editingList)} 
                disabled={!newListName.trim()}
              >
                Spara ändringar
              </Button>
              <Button variant="outline" onClick={() => setEditingList(null)}>
                Avbryt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};