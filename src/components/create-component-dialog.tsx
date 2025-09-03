'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
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
import { Plus, Upload, X, Package } from 'lucide-react'

const categories = [
  'Microcontrôleurs',
  'Modules RF',
  'Amplificateurs',
  'Résistances',
  'Condensateurs',
  'Inductances',
  'Diodes',
  'Transistors',
  'Connecteurs',
  'Capteurs',
  'Afficheurs',
  'Mémoires',
  'Oscillateurs',
  'Régulateurs',
  'Autres'
]

const packages = [
  'DIP-8', 'DIP-14', 'DIP-16', 'DIP-20', 'DIP-28', 'DIP-40',
  'SOIC-8', 'SOIC-14', 'SOIC-16', 'SOIC-20', 'SOIC-28',
  'TSSOP-8', 'TSSOP-14', 'TSSOP-16', 'TSSOP-20', 'TSSOP-28',
  'QFP-32', 'QFP-44', 'QFP-64', 'QFP-100', 'QFP-144',
  'LQFP-32', 'LQFP-48', 'LQFP-64', 'LQFP-100', 'LQFP-144',
  'BGA-64', 'BGA-100', 'BGA-144', 'BGA-256',
  '0402', '0603', '0805', '1206', '1210', '2512',
  'SOT-23', 'SOT-89', 'SOT-223', 'TO-92', 'TO-220', 'TO-263',
  'Module', 'Autre'
]

interface ComponentFormData {
  name: string
  mpn: string
  manufacturer: string
  description: string
  category: string
  package: string
  footprint: string
  unitPrice: string
  currency: string
  minOrderQty: string
  datasheetUrl: string
  imageUrl: string
  tags: string[]
  specifications: Record<string, string>
}

const initialFormData: ComponentFormData = {
  name: '',
  mpn: '',
  manufacturer: '',
  description: '',
  category: '',
  package: '',
  footprint: '',
  unitPrice: '',
  currency: 'EUR',
  minOrderQty: '1',
  datasheetUrl: '',
  imageUrl: '',
  tags: [],
  specifications: {}
}

export function CreateComponentDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<ComponentFormData>(initialFormData)
  const [newTag, setNewTag] = useState('')
  const [newSpecKey, setNewSpecKey] = useState('')
  const [newSpecValue, setNewSpecValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof ComponentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }))
      setNewSpecKey('')
      setNewSpecValue('')
    }
  }

  const removeSpecification = (keyToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: Object.fromEntries(
        Object.entries(prev.specifications).filter(([key]) => key !== keyToRemove)
      )
    }))
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement component creation with tRPC
      console.log('Creating component:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form and close dialog
      setFormData(initialFormData)
      setOpen(false)
    } catch (error) {
      console.error('Error creating component:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = formData.name && formData.mpn && formData.manufacturer && formData.category

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau composant
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Créer un nouveau composant
          </DialogTitle>
          <DialogDescription>
            Ajoutez un nouveau composant à votre bibliothèque avec toutes ses spécifications.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Informations de base</TabsTrigger>
            <TabsTrigger value="specs">Spécifications</TabsTrigger>
            <TabsTrigger value="resources">Ressources</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du composant *</Label>
                <Input
                  id="name"
                  placeholder="ex: STM32F103C8T6"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpn">MPN (Manufacturer Part Number) *</Label>
                <Input
                  id="mpn"
                  placeholder="ex: STM32F103C8T6"
                  value={formData.mpn}
                  onChange={(e) => handleInputChange('mpn', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Fabricant *</Label>
                <Input
                  id="manufacturer"
                  placeholder="ex: STMicroelectronics"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Description détaillée du composant..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package">Package</Label>
                <Select value={formData.package} onValueChange={(value) => handleInputChange('package', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un package" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>
                        {pkg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="footprint">Empreinte PCB</Label>
                <Input
                  id="footprint"
                  placeholder="ex: LQFP-48"
                  value={formData.footprint}
                  onChange={(e) => handleInputChange('footprint', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Prix unitaire</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderQty">Quantité minimum</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  placeholder="1"
                  value={formData.minOrderQty}
                  onChange={(e) => handleInputChange('minOrderQty', e.target.value)}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ajouter un tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Ajouter
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Spécifications techniques</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajoutez les caractéristiques techniques du composant.
                </p>
              </div>

              {/* Existing specifications */}
              <div className="space-y-2">
                {Object.entries(formData.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2 border rounded">
                    <span className="font-medium min-w-0 flex-1">{key}:</span>
                    <span className="text-muted-foreground min-w-0 flex-1">{value}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSpecification(key)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add new specification */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nom de la spécification"
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                />
                <Input
                  placeholder="Valeur"
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                />
              </div>
              <Button type="button" variant="outline" onClick={addSpecification}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter spécification
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="datasheetUrl">URL de la datasheet</Label>
                <Input
                  id="datasheetUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.datasheetUrl}
                  onChange={(e) => handleInputChange('datasheetUrl', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
              </div>

              {/* Image preview */}
              {formData.imageUrl && (
                <div className="space-y-2">
                  <Label>Aperçu de l'image</Label>
                  <div className="w-32 h-32 border rounded-lg flex items-center justify-center bg-muted">
                    <img
                      src={formData.imageUrl}
                      alt="Aperçu"
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isLoading}>
            {isLoading ? 'Création...' : 'Créer le composant'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}