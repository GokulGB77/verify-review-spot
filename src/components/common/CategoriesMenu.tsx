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
} from "lucide-react";

interface CategoriesMenuProps {
  variant?: "desktop" | "mobile";
}

const categories = [
  { label: "Art & Design", icon: Palette, group: "Lifestyle" },
  { label: "Autos & Vehicles", icon: Car, group: "Lifestyle" },
  { label: "Baby & Kids", icon: Baby, group: "Lifestyle" },
  { label: "Beauty", icon: Sparkles, group: "Lifestyle" },
  { label: "Food & Drink", icon: Utensils, group: "Lifestyle" },
  { label: "Health", icon: HeartPulse, group: "Lifestyle" },
  { label: "Hobbies", icon: Puzzle, group: "Lifestyle" },
  { label: "Pets & Animals", icon: PawPrint, group: "Lifestyle" },
  { label: "Shopping", icon: ShoppingBag, group: "Lifestyle" },
  { label: "Society", icon: Users, group: "Lifestyle" },
  { label: "Sports", icon: Dumbbell, group: "Lifestyle" },
  { label: "Travel", icon: Plane, group: "Lifestyle" },

  { label: "Business", icon: Briefcase, group: "Professional" },
  { label: "Finance", icon: Wallet, group: "Professional" },
  { label: "Jobs", icon: BriefcaseBusiness, group: "Professional" },
  { label: "Law & Government", icon: Scale, group: "Professional" },
  { label: "Real Estate", icon: Building2, group: "Professional" },

  { label: "Computers & Technology", icon: Cpu, group: "Knowledge" },
  { label: "Education", icon: GraduationCap, group: "Knowledge" },
  { label: "Entertainment", icon: Clapperboard, group: "Knowledge" },
  { label: "Science", icon: Atom, group: "Knowledge" },
];

const groups = [
  { name: "Lifestyle", description: "Daily life, health, travel and more" },
  { name: "Professional", description: "Work, money and public services" },
  { name: "Knowledge", description: "Learn, tech and media" },
];

export default function CategoriesMenu({ variant = "desktop" }: CategoriesMenuProps) {
  const [open, setOpen] = useState(false);

  const Grid = () => (
    <div className="max-h-[420px] overflow-auto">
      {groups.map((g) => {
        const items = categories.filter((c) => c.group === g.name);
        return (
          <div key={g.name} className="py-3">
            <div className="px-3">
              <div className="text-xs font-semibold text-muted-foreground tracking-wide">
                {g.name}
              </div>
              <div className="text-[11px] text-muted-foreground/80 mb-2">{g.description}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1" role="menu">
              {items.map(({ label, icon: Icon }) => (
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
        );
      })}
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
              {groups.map((g) => (
                <AccordionItem key={g.name} value={g.name}>
                  <AccordionTrigger className="text-sm">{g.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 gap-1">
                      {categories
                        .filter((c) => c.group === g.name)
                        .map(({ label, icon: Icon }) => (
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
              ))}
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
