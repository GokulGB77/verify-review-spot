import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CSVRow {
  name: string;
  legal_name?: string;
  entity_type: string;
  industry?: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  founded_year?: number;
  number_of_employees?: string;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const EntityBulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const entityTypes = ['business', 'service', 'movie_theatre', 'institution', 'learning_platform', 'ecommerce', 'product', 'other'];

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
    });

    return errors;
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'founded_year':
            row[header] = value ? parseInt(value) : undefined;
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
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      const errors = validateCSVData(parsed);
      
      setCsvData(parsed);
      setValidationErrors(errors);
      setIsPreviewMode(true);
    };
    reader.readAsText(selectedFile);
  };

  const bulkUploadMutation = useMutation({
    mutationFn: async (data: CSVRow[]) => {
      const entitiesToInsert = data.map(row => ({
        name: row.name,
        legal_name: row.legal_name || row.name,
        entity_type: row.entity_type.toLowerCase() as 'business' | 'service' | 'movie_theatre' | 'institution' | 'learning_platform' | 'ecommerce' | 'product' | 'other',
        industry: row.industry,
        description: row.description,
        founded_year: row.founded_year,
        number_of_employees: row.number_of_employees,
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
        },
        status: 'active'
      }));

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

    bulkUploadMutation.mutate(csvData);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      'name,legal_name,entity_type,industry,description,website,email,phone,address,city,state,country,pincode,founded_year,number_of_employees',
      'TechCorp Ltd,TechCorp Limited,business,Technology,Software development company,https://techcorp.com,contact@techcorp.com,+1234567890,123 Tech Street,San Francisco,CA,USA,94105,2020,50-100',
      'Local Restaurant,Local Restaurant LLC,business,Food & Beverage,Family-owned restaurant,https://localrest.com,info@localrest.com,+9876543210,456 Food Ave,New York,NY,USA,10001,2015,10-25'
    ].join('\n');

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entity_upload_sample.csv';
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
            Upload multiple entities at once using a CSV file. Make sure your CSV includes required fields: name, entity_type.
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

          {isPreviewMode && csvData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Preview ({csvData.length} entities)</h3>
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
                  disabled={validationErrors.length > 0 || bulkUploadMutation.isPending}
                >
                  {bulkUploadMutation.isPending ? 'Uploading...' : 'Upload Entities'}
                </Button>
              </div>

              <div className="border rounded-lg max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.slice(0, 10).map((row, index) => {
                      const rowErrors = validationErrors.filter(e => e.row === index + 1);
                      return (
                        <TableRow key={index} className={rowErrors.length > 0 ? 'bg-red-50' : ''}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell className="capitalize">{row.entity_type?.replace('_', ' ')}</TableCell>
                          <TableCell>{row.industry || 'N/A'}</TableCell>
                          <TableCell>{row.website || 'N/A'}</TableCell>
                          <TableCell>
                            {rowErrors.length > 0 ? (
                              <Badge variant="destructive">Error</Badge>
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