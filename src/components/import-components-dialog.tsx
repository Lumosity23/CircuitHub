'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'

interface ParsedComponent {
  name: string
  mpn: string
  manufacturer: string
  description?: string
  category?: string
  package?: string
  unitPrice?: number
  currency?: string
  errors: string[]
  isValid: boolean
}

const csvTemplate = `name,mpn,manufacturer,description,category,package,unitPrice,currency
STM32F103C8T6,STM32F103C8T6,STMicroelectronics,Microcontrôleur ARM Cortex-M3,Microcontrôleurs,LQFP-48,2.45,EUR
ESP32-WROOM-32,ESP32-WROOM-32,Espressif,Module WiFi/Bluetooth,Modules RF,SMD-38,3.20,EUR
LM358N,LM358N,Texas Instruments,Amplificateur opérationnel double,Amplificateurs,DIP-8,0.35,EUR`

export function ImportComponentsDialog() {
  const [open, setOpen] = useState(false)
  const [csvContent, setCsvContent] = useState('')
  const [parsedComponents, setParsedComponents] = useState<ParsedComponent[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateComponent = (component: any): ParsedComponent => {
    const errors: string[] = []
    
    if (!component.name?.trim()) errors.push('Nom requis')
    if (!component.mpn?.trim()) errors.push('MPN requis')
    if (!component.manufacturer?.trim()) errors.push('Fabricant requis')
    
    const unitPrice = parseFloat(component.unitPrice)
    if (component.unitPrice && (isNaN(unitPrice) || unitPrice < 0)) {
      errors.push('Prix unitaire invalide')
    }

    return {
      name: component.name?.trim() || '',
      mpn: component.mpn?.trim() || '',
      manufacturer: component.manufacturer?.trim() || '',
      description: component.description?.trim() || '',
      category: component.category?.trim() || '',
      package: component.package?.trim() || '',
      unitPrice: isNaN(unitPrice) ? undefined : unitPrice,
      currency: component.currency?.trim() || 'EUR',
      errors,
      isValid: errors.length === 0
    }
  }

  const parseCsv = (content: string): ParsedComponent[] => {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const components: ParsedComponent[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const component: any = {}

      headers.forEach((header, index) => {
        component[header] = values[index] || ''
      })

      components.push(validateComponent(component))
    }

    return components
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvContent(content)
      const parsed = parseCsv(content)
      setParsedComponents(parsed)
      setActiveTab('preview')
    }
    reader.readAsText(file)
  }

  const handleTextParse = () => {
    if (!csvContent.trim()) return
    
    const parsed = parseCsv(csvContent)
    setParsedComponents(parsed)
    setActiveTab('preview')
  }

  const handleImport = async () => {
    const validComponents = parsedComponents.filter(c => c.isValid)
    if (validComponents.length === 0) return

    setIsLoading(true)
    try {
      // TODO: Implement bulk component creation with tRPC
      console.log('Importing components:', validComponents)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Reset and close
      setCsvContent('')
      setParsedComponents([])
      setActiveTab('upload')
      setOpen(false)
    } catch (error) {
      console.error('Error importing components:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'components-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validCount = parsedComponents.filter(c => c.isValid).length
  const errorCount = parsedComponents.filter(c => !c.isValid).length

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importer des composants depuis CSV
          </DialogTitle>
          <DialogDescription>
            Importez plusieurs composants en une fois à partir d'un fichier CSV ou en collant les données directement.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload / Saisie</TabsTrigger>
            <TabsTrigger value="preview" disabled={parsedComponents.length === 0}>
              Aperçu ({parsedComponents.length})
            </TabsTrigger>
            <TabsTrigger value="template">Modèle CSV</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Télécharger un fichier CSV</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Glissez-déposez votre fichier CSV ici ou cliquez pour sélectionner
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Sélectionner un fichier
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 border-t"></div>
                <span className="text-sm text-muted-foreground">OU</span>
                <div className="flex-1 border-t"></div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <Label htmlFor="csvText">Coller les données CSV</Label>
                <Textarea
                  id="csvText"
                  placeholder="name,mpn,manufacturer,description,category,package,unitPrice,currency
STM32F103C8T6,STM32F103C8T6,STMicroelectronics,Microcontrôleur ARM,Microcontrôleurs,LQFP-48,2.45,EUR"
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleTextParse} disabled={!csvContent.trim()}>
                <FileText className="w-4 h-4 mr-2" />
                Analyser les données
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {parsedComponents.length > 0 && (
              <>
                {/* Summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{validCount} composants valides</span>
                  </div>
                  {errorCount > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium">{errorCount} avec erreurs</span>
                    </div>
                  )}
                </div>

                {/* Components Table */}
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Statut</TableHead>
                        <TableHead>Nom</TableHead>
                        <TableHead>MPN</TableHead>
                        <TableHead>Fabricant</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Erreurs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedComponents.map((component, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            {component.isValid ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Valide
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erreur
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{component.name}</TableCell>
                          <TableCell>{component.mpn}</TableCell>
                          <TableCell>{component.manufacturer}</TableCell>
                          <TableCell>{component.category}</TableCell>
                          <TableCell>
                            {component.unitPrice ? `${component.unitPrice} ${component.currency}` : '-'}
                          </TableCell>
                          <TableCell>
                            {component.errors.length > 0 && (
                              <div className="space-y-1">
                                {component.errors.map((error, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {error}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="template" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Format CSV requis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Votre fichier CSV doit contenir les colonnes suivantes. Les colonnes marquées d'un * sont obligatoires.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Colonnes obligatoires</h4>
                  <ul className="text-sm space-y-1">
                    <li><code className="bg-muted px-1 rounded">name*</code> - Nom du composant</li>
                    <li><code className="bg-muted px-1 rounded">mpn*</code> - Numéro de pièce fabricant</li>
                    <li><code className="bg-muted px-1 rounded">manufacturer*</code> - Fabricant</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Colonnes optionnelles</h4>
                  <ul className="text-sm space-y-1">
                    <li><code className="bg-muted px-1 rounded">description</code> - Description</li>
                    <li><code className="bg-muted px-1 rounded">category</code> - Catégorie</li>
                    <li><code className="bg-muted px-1 rounded">package</code> - Package</li>
                    <li><code className="bg-muted px-1 rounded">unitPrice</code> - Prix unitaire</li>
                    <li><code className="bg-muted px-1 rounded">currency</code> - Devise (EUR par défaut)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Exemple de fichier CSV</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-sm overflow-x-auto">{csvTemplate}</pre>
                </div>
              </div>

              <Button onClick={downloadTemplate}>
                <Download className="w-4 h-4 mr-2" />
                Télécharger le modèle CSV
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          {activeTab === 'preview' && validCount > 0 && (
            <Button onClick={handleImport} disabled={isLoading}>
              {isLoading ? 'Import en cours...' : `Importer ${validCount} composant${validCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}