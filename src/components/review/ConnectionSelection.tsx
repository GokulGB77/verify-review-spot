
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ConnectionSelectionProps {
  selectedConnection: string;
  onConnectionChange: (value: string) => void;
}

const ConnectionSelection = ({ selectedConnection, onConnectionChange }: ConnectionSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Connection (Optional)</CardTitle>
        <CardDescription>
          If applicable, specify your relationship to this business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedConnection}
          onValueChange={onConnectionChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="" id="none" />
            <Label htmlFor="none">No specific connection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Verified Employee" id="employee" />
            <Label htmlFor="employee">I work/worked here</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Verified Student" id="student" />
            <Label htmlFor="student">I'm a student/alumni</Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default ConnectionSelection;
