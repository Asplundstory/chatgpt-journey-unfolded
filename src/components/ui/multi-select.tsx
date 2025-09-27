import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxDisplayed?: number;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Välj alternativ...",
  maxDisplayed = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const displayValue = () => {
    if (value.length === 0) return placeholder;
    
    const selectedOptions = options.filter(opt => value.includes(opt.value));
    
    if (selectedOptions.length <= maxDisplayed) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs px-2 py-0 h-5"
            >
              {option.label}
              <X
                className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive"
                onClick={(e) => handleRemove(option.value, e)}
              />
            </Badge>
          ))}
        </div>
      );
    }
    
    return `${selectedOptions.length} valda`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-[2.5rem] h-auto"
        >
          {displayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="max-h-60 overflow-auto">
          {value.length > 0 && (
            <div className="p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange([])}
                className="h-8 text-xs w-full justify-start"
              >
                <X className="h-3 w-3 mr-2" />
                Rensa alla ({value.length})
              </Button>
            </div>
          )}
          <div className="p-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                onClick={() => handleSelect(option.value)}
              >
                <Checkbox
                  checked={value.includes(option.value)}
                  onChange={() => handleSelect(option.value)}
                />
                <span className="text-sm">{option.label}</span>
                {value.includes(option.value) && (
                  <Check className="h-4 w-4 ml-auto text-primary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}