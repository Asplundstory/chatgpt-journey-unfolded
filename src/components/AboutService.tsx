import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Database, TrendingUp, Calendar, Building } from "lucide-react";

export const AboutService = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-primary" />
          <CardTitle>Om tjänsten</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3 text-lg">Datakällor och beräkningsmetoder</h3>
          <p className="text-muted-foreground mb-4">
            Denna tjänst kombinerar data från flera källor för att ge dig den mest kompletta bilden av vininvesteringsmöjligheter:
          </p>
        </div>

        <div className="grid gap-4">
          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
            <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Produktinformation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Grundläggande produktdata hämtas från <strong>Systembolagets öppna API</strong>, inklusive:
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Artikelnummer</Badge>
                <Badge variant="outline">Pris</Badge>
                <Badge variant="outline">Ursprung</Badge>
                <Badge variant="outline">Producent</Badge>
                <Badge variant="outline">Alkoholhalt</Badge>
                <Badge variant="outline">Årgång</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Investeringsanalys</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Våra AI-modeller beräknar investeringspotential baserat på:
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Historiska prisrörelser</Badge>
                <Badge variant="outline">Årgångskvalitet</Badge>
                <Badge variant="outline">Producent reputation</Badge>
                <Badge variant="outline">Lagringskapacitet</Badge>
                <Badge variant="outline">Marknadstrender</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
            <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Dricknings- och lagringsrekommendationer</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Optimala drickningsperioder och lagringstider beräknas från:
              </p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">Vintyp och stil</Badge>
                <Badge variant="outline">Årgångsegenskaper</Badge>
                <Badge variant="outline">Producent guidelines</Badge>
                <Badge variant="outline">Expertbedömningar</Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-accent/20 rounded-lg">
            <Building className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Kvalitet och tillförlitlighet</h4>
              <p className="text-sm text-muted-foreground">
                All data synkroniseras regelbundet och alla beräkningar är baserade på etablerade 
                metoder inom vininvestering. Investeringsråd ska alltid kombineras med egen research 
                och riskbedömning.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Senast uppdaterad: {new Date().toLocaleDateString('sv-SE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};