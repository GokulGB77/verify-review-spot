
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessAboutProps {
  business: any;
}

const BusinessAbout = ({ business }: BusinessAboutProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About {business.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Company Information</h3>
            <div className="space-y-2 text-sm">
              {business.founded_year && (
                <div><span className="font-medium">Founded:</span> {business.founded_year}</div>
              )}
              {business.employee_count && (
                <div><span className="font-medium">Company Size:</span> {business.employee_count} employees</div>
              )}
              <div><span className="font-medium">Industry:</span> {business.category}</div>
            </div>
          </div>
          {business.programs && business.programs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Programs Offered</h3>
              <div className="flex flex-wrap gap-2">
                {business.programs.map((program: string) => (
                  <Badge key={program} variant="outline">
                    {program}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
        {business.description && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700">{business.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessAbout;
