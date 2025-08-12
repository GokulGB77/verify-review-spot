import { useState } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import {
  Palette,
  Car,
  Baby,
  Sparkles,
  Briefcase,
  Cpu,
  GraduationCap,
  Clapperboard,
  Wallet,
  Utensils,
  HeartPulse,
  Puzzle,
  BriefcaseBusiness,
  Scale,
  PawPrint,
  Building2,
  Atom,
  ShoppingBag,
  Users,
  Dumbbell,
  Plane,
  ChevronDown,
  Shapes,
} from "lucide-react";

interface CategoriesMenuProps {
  variant?: "desktop" | "mobile";
}

const groupOrder = [
  { name: "Lifestyle", description: "Daily life, health, travel and more" },
  { name: "Professional", description: "Work, money and public services" },
  { name: "Knowledge", description: "Learn, tech and media" },
  { name: "Other", description: "Everything else" },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "Art & Design": Palette,
  "Autos & Vehicles": Car,
  "Baby & Kids": Baby,
  "Beauty": Sparkles,
  "Food & Drink": Utensils,
  "Health": HeartPulse,
  "Hobbies": Puzzle,
  "Pets & Animals": PawPrint,
  "Shopping": ShoppingBag,
  "Society": Users,
  "Sports": Dumbbell,
  "Travel": Plane,
  "Business": Briefcase,
  "Finance": Wallet,
  "Jobs": BriefcaseBusiness,
  "Law & Government": Scale,
  "Real Estate": Building2,
  "Computers & Technology": Cpu,
  // Map common education variants used in the directory
  "Education": GraduationCap,
  "Education & Training": GraduationCap,
  "Education/Training": GraduationCap,
  "Entertainment": Clapperboard,
  "Science": Atom,
};

const guessGroup = (label: string): string => {
  const l = label.toLowerCase();
  if (/(business|finance|law|government|job|real estate|tax|bank|insurance)/.test(l)) return "Professional";
  if (/(tech|computer|software|science|education|school|university|media|entertainment)/.test(l)) return "Knowledge";
  if (/(health|food|drink|travel|sport|beauty|pet|shopping|society|hobby|auto|vehicle|art|design|baby|kids)/.test(l)) return "Lifestyle";
  return "Other";
};

export default function CategoriesMenu({ variant = "desktop" }: CategoriesMenuProps) {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useCategories();
  const categoriesList = data?.categories || [];
  const computedItems = categoriesList.map((label) => ({
    label,
    icon: (iconMap[label] || Shapes),
    group: guessGroup(label),
  }));
  const activeGroups = groupOrder
    .map((g) => ({ ...g, items: computedItems.filter((c) => c.group === g.name) }))
    .filter((g) => g.items.length > 0);

  const Grid = () => (
    <div className="max-h-[420px] overflow-auto">
      {isLoading ? (
        <div className="p-4 text-sm text-muted-foreground">Loading categories…</div>
      ) : (
        activeGroups.map((g) => (
          <div key={g.name} className="py-3">
            <div className="px-3">
              <div className="text-xs font-semibold text-muted-foreground tracking-wide">{g.name}</div>
              <div className="text-[11px] text-muted-foreground/80 mb-2">{g.description}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1" role="menu">
              {g.items.map(({ label, icon: Icon }) => (
                <DropdownMenuItem key={label} asChild className="p-0">
                  <Link
                    to={`/entities?category=${encodeURIComponent(label)}`}
                    className="flex items-center gap-3 rounded-md px-3 py-2 transition-all hover:bg-accent focus:bg-accent focus:outline-none group"
                  >
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/10 transition-transform group-hover:scale-105">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-foreground truncate">{label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>
          </div>
        ))
      )}
      <div className="sticky bottom-0 mt-2 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DropdownMenuItem asChild className="p-0">
          <Link
            to="/entities"
            className="block px-3 py-2 text-sm font-medium text-primary hover:underline"
          >
            View All Categories
          </Link>
        </DropdownMenuItem>
      </div>
    </div>
  );

  if (variant === "mobile") {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="md:hidden">
            Categories <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Categories</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <Accordion type="multiple" className="w-full">
              {isLoading ? (
                <div className="p-2 text-sm text-muted-foreground">Loading…</div>
              ) : (
                activeGroups.map((g) => (
                  <AccordionItem key={g.name} value={g.name}>
                    <AccordionTrigger className="text-sm">{g.name}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 gap-1">
                        {g.items.map(({ label, icon: Icon }) => (
                          <Link
                            key={label}
                            to={`/entities?category=${encodeURIComponent(label)}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-accent"
                          >
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/10">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="text-sm text-foreground">{label}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
            <div className="pt-3">
              <Link to="/entities" onClick={() => setOpen(false)} className="inline-flex items-center text-primary text-sm font-medium hover:underline">
                View All Categories
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="hidden md:inline-flex items-center gap-1"
        >
          Categories <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={12}
        className="w-[680px] md:w-[720px] lg:w-[840px] p-3 z-50 animate-enter"
      >
        <Grid />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
