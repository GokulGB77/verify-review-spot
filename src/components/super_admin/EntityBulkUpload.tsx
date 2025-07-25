import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CSVRow {
  name: string;
  legal_name?: string;
  entity_type: string;
  industry?: string;
  sub_industry?: string;
  description?: string;
  tagline?: string;
  founded_year?: number;
  number_of_employees?: string;
  revenue_range?: string;
  // Contact info
  website?: string;
  email?: string;
  phone?: string;
  // Location info
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  // Media & Additional info
  logo_url?: string;
  cover_image_url?: string;
  founders?: string;
  category_tags?: string;
  keywords?: string;
  // Status & Verification
  is_verified?: boolean;
  trust_level?: string;
  status?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ExistingEntity {
  name: string;
  rowIndex: number;
  existingId: string;
}

const EntityBulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [existingEntities, setExistingEntities] = useState<ExistingEntity[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [excludeDuplicates, setExcludeDuplicates] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entityTypes = ['business', 'service', 'movie_theatre', 'institution', 'learning_platform', 'ecommerce', 'product', 'other'];
  const trustLevels = ['basic', 'verified', 'trusted_partner'];

  const validateCSVData = (data: CSVRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    data.forEach((row, index) => {
      // Required fields validation
      if (!row.name?.trim()) {
        errors.push({ row: index + 1, field: 'name', message: 'Name is required' });
      }
      
      if (!row.entity_type?.trim()) {
        errors.push({ row: index + 1, field: 'entity_type', message: 'Entity type is required' });
      } else if (!entityTypes.includes(row.entity_type.toLowerCase())) {
        errors.push({ 
          row: index + 1, 
          field: 'entity_type', 
          message: `Invalid entity type. Must be one of: ${entityTypes.join(', ')}` 
        });
      }

      // Optional field validations
      if (row.founded_year && (isNaN(row.founded_year) || row.founded_year < 1800 || row.founded_year > new Date().getFullYear())) {
        errors.push({ row: index + 1, field: 'founded_year', message: 'Invalid founded year' });
      }

      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errors.push({ row: index + 1, field: 'email', message: 'Invalid email format' });
      }

      if (row.trust_level && !trustLevels.includes(row.trust_level.toLowerCase())) {
        errors.push({ 
          row: index + 1, 
          field: 'trust_level', 
          message: `Invalid trust level. Must be one of: ${trustLevels.join(', ')}` 
        });
      }

      if (row.status && !['active', 'inactive'].includes(row.status.toLowerCase())) {
        errors.push({ 
          row: index + 1, 
          field: 'status', 
          message: 'Status must be either "active" or "inactive"' 
        });
      }
    });

    return errors;
  };

  const checkForExistingEntities = async (data: CSVRow[]): Promise<ExistingEntity[]> => {
    const entityNames = data.map(row => row.name?.trim()).filter(Boolean);
    
    if (entityNames.length === 0) return [];

    try {
      const { data: existingEntities, error } = await supabase
        .from('entities')
        .select('entity_id, name')
        .in('name', entityNames);

      if (error) {
        console.error('Error checking for existing entities:', error);
        return [];
      }

      const existing: ExistingEntity[] = [];
      existingEntities?.forEach(entity => {
        const rowIndex = data.findIndex(row => row.name?.trim() === entity.name);
        if (rowIndex !== -1) {
          existing.push({
            name: entity.name,
            rowIndex,
            existingId: entity.entity_id
          });
        }
      });

      return existing;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return [];
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    // Simple CSV parser that handles quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'founded_year':
            row[header] = value ? parseInt(value) : undefined;
            break;
          case 'is_verified':
            row[header] = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes' || value === '1';
            break;
          default:
            row[header] = value || undefined;
        }
      });

      if (row.name) { // Only add rows with name
        data.push(row);
      }
    }

    return data;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file",
        description: "Please select a CSV file",
        variant: "destructive"
      });
      return;
    }

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      
      const errors = validateCSVData(parsed);
      
      setCsvData(parsed);
      setValidationErrors(errors);
      
      // Check for existing entities
      setIsCheckingDuplicates(true);
      const existing = await checkForExistingEntities(parsed);
      setExistingEntities(existing);
      setIsCheckingDuplicates(false);
      
      if (existing.length > 0) {
        setShowDuplicates(true);
        toast({
          title: "Duplicates found",
          description: `Found ${existing.length} entities that already exist in the database`,
          variant: "default"
        });
      }
      
      setIsPreviewMode(true);
    };
    reader.readAsText(selectedFile);
  };

  const getDataToUpload = (): CSVRow[] => {
    if (!excludeDuplicates) return csvData;
    
    const duplicateRowIndices = existingEntities.map(e => e.rowIndex);
    return csvData.filter((_, index) => !duplicateRowIndices.includes(index));
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (data: CSVRow[]) => {
      const entitiesToInsert = data.map(row => {
        // Parse comma-separated arrays
        const foundersArray = row.founders ? row.founders.split(',').map(f => f.trim()).filter(f => f) : [];
        const categoryTagsArray = row.category_tags ? row.category_tags.split(',').map(t => t.trim()).filter(t => t) : [];
        const keywordsArray = row.keywords ? row.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

        return {
          name: row.name,
          legal_name: row.legal_name || row.name,
          entity_type: row.entity_type.toLowerCase() as 'business' | 'service' | 'movie_theatre' | 'institution' | 'learning_platform' | 'ecommerce' | 'product' | 'other',
          industry: row.industry || null,
          sub_industry: row.sub_industry || null,
          description: row.description || null,
          tagline: row.tagline || null,
          founded_year: row.founded_year || null,
          number_of_employees: row.number_of_employees || null,
          revenue_range: row.revenue_range || null,
          logo_url: row.logo_url || null,
          cover_image_url: row.cover_image_url || null,
          founders: foundersArray.length > 0 ? foundersArray : null,
          category_tags: categoryTagsArray.length > 0 ? categoryTagsArray : null,
          keywords: keywordsArray.length > 0 ? keywordsArray : null,
          is_verified: row.is_verified || false,
          trust_level: (row.trust_level?.toLowerCase() || 'basic') as 'basic' | 'verified' | 'trusted_partner',
          status: row.status?.toLowerCase() || 'active',
          contact: {
            website: row.website || '',
            email: row.email || '',
            phone: row.phone || ''
          },
          location: {
            address: row.address || '',
            city: row.city || '',
            state: row.state || '',
            country: row.country || '',
            pincode: row.pincode || ''
          }
        };
      });

      const { data: result, error } = await supabase
        .from('entities')
        .insert(entitiesToInsert)
        .select();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['entities'] });
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${result.length} entities`,
      });
      
      // Reset form
      setFile(null);
      setCsvData([]);
      setValidationErrors([]);
      setExistingEntities([]);
      setShowDuplicates(false);
      setExcludeDuplicates(true);
      setIsPreviewMode(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload entities",
        variant: "destructive",
      });
    },
  });

  const handleUpload = () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Validation errors",
        description: "Please fix all validation errors before uploading",
        variant: "destructive",
      });
      return;
    }

    const dataToUpload = getDataToUpload();
    
    if (dataToUpload.length === 0) {
      toast({
        title: "No data to upload",
        description: "All entities in the file already exist",
        variant: "destructive",
      });
      return;
    }

    bulkUploadMutation.mutate(dataToUpload);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'name,legal_name,entity_type,industry,sub_industry,description,tagline,founded_year,number_of_employees,revenue_range,website,email,phone,address,city,state,country,pincode,logo_url,cover_image_url,founders,category_tags,keywords,is_verified,trust_level,status',
      'TechCorp Ltd,TechCorp Limited,business,Technology,Software Development,Software development company,Innovation at its finest,2020,50-100,$1M-$5M,https://techcorp.com,contact@techcorp.com,+1234567890,123 Tech Street,San Francisco,CA,USA,94105,https://techcorp.com/logo.png,https://techcorp.com/cover.jpg,"John Doe,Jane Smith","technology,software,web development","software,development,consulting",true,verified,active',
      'Local Restaurant,Local Restaurant LLC,business,Food & Beverage,Restaurant,Family-owned restaurant,Great food great service,2015,10-25,$500K-$1M,https://localrest.com,info@localrest.com,+9876543210,456 Food Ave,New York,NY,USA,10001,,,Mike Johnson,"food,restaurant,dining","restaurant,food,local",false,basic,active'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entity_upload_sample_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Entity Upload
          </CardTitle>
          <CardDescription>
            Upload multiple entities at once using a CSV file. Required fields: name, entity_type. 
            Download the sample file to see all available fields including contact info, location, media URLs, and verification status.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-file">Select CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={downloadSampleCSV}>
                <FileText className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </div>
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Validation Errors Found:</p>
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <p key={index} className="text-sm">
                      Row {error.row}, {error.field}: {error.message}
                    </p>
                  ))}
                  {validationErrors.length > 5 && (
                    <p className="text-sm">...and {validationErrors.length - 5} more errors</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isCheckingDuplicates && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Checking for existing entities in the database...
              </AlertDescription>
            </Alert>
          )}

          {existingEntities.length > 0 && showDuplicates && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Found {existingEntities.length} duplicate entities:</p>
                  <div className="max-h-32 overflow-y-auto">
                    {existingEntities.map((entity, index) => (
                      <p key={index} className="text-sm">
                        Row {entity.rowIndex + 1}: "{entity.name}" already exists
                      </p>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="exclude-duplicates"
                      checked={excludeDuplicates}
                      onCheckedChange={(checked) => setExcludeDuplicates(checked as boolean)}
                    />
                    <Label htmlFor="exclude-duplicates" className="text-sm">
                      Exclude duplicates and upload only new entities ({getDataToUpload().length} entities)
                    </Label>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isPreviewMode && csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">
                    Preview ({csvData.length} entities
                    {existingEntities.length > 0 && excludeDuplicates && (
                      <span className="text-sm text-muted-foreground">
                        , {getDataToUpload().length} to upload
                      </span>
                    )}
                    )
                  </h3>
                  <Badge variant={validationErrors.length > 0 ? "destructive" : "default"}>
                    {validationErrors.length > 0 ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        {validationErrors.length} errors
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </>
                    )}
                  </Badge>
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={validationErrors.length > 0 || bulkUploadMutation.isPending || getDataToUpload().length === 0}
                >
                  {bulkUploadMutation.isPending ? 'Uploading...' : `Upload ${getDataToUpload().length} Entities`}
                </Button>
              </div>

              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Trust Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, index) => {
                      const rowErrors = validationErrors.filter(e => e.row === index + 1);
                      const isDuplicate = existingEntities.some(e => e.rowIndex === index);
                      const willBeSkipped = isDuplicate && excludeDuplicates;
                      
                      return (
                        <TableRow 
                          key={index} 
                          className={`
                            ${rowErrors.length > 0 ? 'bg-red-50' : ''} 
                            ${willBeSkipped ? 'bg-yellow-50 opacity-60' : ''}
                          `}
                        >
                          <TableCell className="font-medium">
                            {row.name}
                            {isDuplicate && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Duplicate
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{row.entity_type?.replace('_', ' ')}</TableCell>
                          <TableCell>{row.industry || 'N/A'}</TableCell>
                          <TableCell>{row.city && row.country ? `${row.city}, ${row.country}` : row.city || row.country || 'N/A'}</TableCell>
                          <TableCell className="capitalize">{row.trust_level || 'basic'}</TableCell>
                          <TableCell>
                            <Badge variant={(row.status || 'active') === 'active' ? 'default' : 'secondary'}>
                              {(row.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {rowErrors.length > 0 ? (
                              <Badge variant="destructive">Error</Badge>
                            ) : willBeSkipped ? (
                              <Badge variant="secondary">Will Skip</Badge>
                            ) : (
                              <Badge variant="default">Valid</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {csvData.length > 10 && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    ...and {csvData.length - 10} more entities
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EntityBulkUpload;