'use client';

import React, { useRef } from 'react';
import { Download, Upload, FileDown, FileUp, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ExportImportProps {
  onExport: () => string;
  onImport: (jsonData: string) => { success: boolean; message: string; count?: number };
  totalActivities: number;
}

export function ExportImport({ onExport, onImport, totalActivities }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = onExport();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `actividades-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Backup exportado correctamente', {
        description: `${totalActivities} actividades guardadas en el archivo`
      });
    } catch (error) {
      toast.error('Error al exportar', {
        description: 'No se pudo crear el archivo de backup'
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = onImport(jsonData);
        
        if (result.success) {
          toast.success('Datos importados correctamente', {
            description: result.message
          });
        } else {
          toast.error('Error al importar', {
            description: result.message
          });
        }
      } catch (error) {
        toast.error('Error al leer el archivo', {
          description: 'Verifica que el archivo sea válido'
        });
      }
    };
    
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Backup y Restauración
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Information Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Usa estas herramientas para respaldar tus actividades o transferirlas a otro dispositivo.
            Los backups incluyen todas tus actividades con fechas, prioridades y estados.
          </AlertDescription>
        </Alert>

        {/* Export Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Exportar Actividades</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Descarga todas tus actividades en un archivo JSON
              </p>
            </div>
            <Button
              onClick={handleExport}
              disabled={totalActivities === 0}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar ({totalActivities})
            </Button>
          </div>
          
          {totalActivities === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay actividades para exportar
            </p>
          )}
        </div>

        <Separator />

        {/* Import Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Importar Actividades</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Restaura actividades desde un archivo de backup
              </p>
            </div>
            <Button
              onClick={triggerFileInput}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Seleccionar Archivo
            </Button>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Al importar actividades, se reemplazarán todas las actividades actuales.
              Asegúrate de exportar un backup antes si quieres conservar tus datos actuales.
            </AlertDescription>
          </Alert>
        </div>

        <Separator />

        {/* Instructions */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Instrucciones</Label>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Exportar:</strong> Descarga un archivo JSON con todas tus actividades para crear un backup seguro
              </p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>
                <strong>Importar:</strong> Selecciona un archivo de backup para restaurar tus actividades
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FileUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p>
                Los archivos de backup son compatibles entre diferentes dispositivos y navegadores
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}