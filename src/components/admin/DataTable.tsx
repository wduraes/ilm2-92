import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface Filter {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filters?: Filter[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
  loading?: boolean;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: Record<string, string>) => void;
  createUrl?: string;
  createLabel?: string;
  title: string;
}

export default function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filters = [],
  pagination,
  loading = false,
  onPageChange,
  onFiltersChange,
  createUrl,
  createLabel = 'Adicionar',
  title,
}: DataTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localFilters, setLocalFilters] = useState<Record<string, string>>({});

  // Initialize filters from URL
  useEffect(() => {
    const filtersFromUrl: Record<string, string> = {};
    filters.forEach(filter => {
      const value = searchParams.get(filter.key);
      if (value) {
        filtersFromUrl[filter.key] = value;
      }
    });
    setLocalFilters(filtersFromUrl);
  }, [searchParams, filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters };
    
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    
    setLocalFilters(newFilters);
    
    // Update URL
    const newSearchParams = new URLSearchParams(searchParams);
    if (value) {
      newSearchParams.set(key, value);
    } else {
      newSearchParams.delete(key);
    }
    newSearchParams.set('page', '1'); // Reset to first page when filtering
    setSearchParams(newSearchParams);
    
    // Notify parent
    onFiltersChange?.(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
    onPageChange?.(page);
  };

  const getValue = (row: T, key: string): any => {
    return key.includes('.') 
      ? key.split('.').reduce((obj, k) => obj?.[k], row)
      : row[key];
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {createUrl && (
          <Button asChild>
            <Link to={createUrl}>
              <Plus className="h-4 w-4 mr-2" />
              {createLabel}
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => (
                <div key={filter.key}>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {filter.label}
                  </label>
                  {filter.type === 'text' ? (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={filter.placeholder || `Buscar por ${filter.label.toLowerCase()}`}
                        value={localFilters[filter.key] || ''}
                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  ) : (
                    <Select
                      value={localFilters[filter.key] || ''}
                      onValueChange={(value) => handleFilterChange(filter.key, value === 'all' ? '' : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecionar ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {filter.options?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={String(column.key)}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, index) => (
                    <TableRow key={row.id || index}>
                      {columns.map((column) => (
                        <TableCell key={String(column.key)}>
                          {column.render 
                            ? column.render(getValue(row, String(column.key)), row)
                            : getValue(row, String(column.key))
                          }
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {Math.min((pagination.currentPage - 1) * 20 + 1, pagination.totalCount)} até{' '}
            {Math.min(pagination.currentPage * 20, pagination.totalCount)} de {pagination.totalCount} registros
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}