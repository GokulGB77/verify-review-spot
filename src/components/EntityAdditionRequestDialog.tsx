
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import EntityAdditionRequestForm from "./EntityAdditionRequestForm";

interface EntityAdditionRequestDialogProps {
  searchQuery?: string;
}

const EntityAdditionRequestDialog = ({ searchQuery }: EntityAdditionRequestDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Plus className="h-4 w-4" />
          Couldn't find what you're looking for? Request for an entity addition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Entity Addition</DialogTitle>
          <DialogDescription>
            Help us expand our platform by requesting new entities.
          </DialogDescription>
        </DialogHeader>
        <EntityAdditionRequestForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};

export default EntityAdditionRequestDialog;
