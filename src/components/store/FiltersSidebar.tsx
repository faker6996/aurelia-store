import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X } from "lucide-react";
import { motion } from "framer-motion";
export interface Filters {
  categories: string[];
  brands: string[];
  priceRange: [number, number];
}
interface FiltersSidebarProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  allCategories: string[];
  allBrands: string[];
  className?: string;
}
const MAX_PRICE = 500;
export function FiltersSidebar({ filters, setFilters, allCategories, allBrands, className }: FiltersSidebarProps) {
  const handleCategoryChange = (category: string) => {
    setFilters({
      ...filters,
      categories: filters.categories.includes(category)
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    });
  };
  const handleBrandChange = (brand: string) => {
    setFilters({
      ...filters,
      brands: filters.brands.includes(brand)
        ? filters.brands.filter((b) => b !== brand)
        : [...filters.brands, brand],
    });
  };
  const handlePriceChange = (value: [number, number]) => {
    setFilters({ ...filters, priceRange: value });
  };
  const clearFilters = () => {
    setFilters({ categories: [], brands: [], priceRange: [0, MAX_PRICE] });
  };
  return (
    <aside className={className}>
      <div className="flex items-center justify-between pb-4 border-b">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
      <Accordion type="multiple" defaultValue={["category", "price", "brand"]} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger className="text-base">Category</AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {allCategories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category}`}
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => handleCategoryChange(category)}
                    />
                    <Label htmlFor={`cat-${category}`} className="font-normal cursor-pointer">{category}</Label>
                  </div>
                ))}
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger className="text-base">Price Range</AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-2">
                <Slider
                  min={0}
                  max={MAX_PRICE}
                  step={10}
                  value={filters.priceRange}
                  onValueChange={handlePriceChange}
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>${filters.priceRange[0]}</span>
                  <span>${filters.priceRange[1]}</span>
                </div>
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="brand">
          <AccordionTrigger className="text-base">Brand</AccordionTrigger>
          <AccordionContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {allBrands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand}`}
                      checked={filters.brands.includes(brand)}
                      onCheckedChange={() => handleBrandChange(brand)}
                    />
                    <Label htmlFor={`brand-${brand}`} className="font-normal cursor-pointer">{brand}</Label>
                  </div>
                ))}
              </div>
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
}