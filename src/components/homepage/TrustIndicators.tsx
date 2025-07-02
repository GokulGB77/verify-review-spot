import { CheckCircle, Lock, Eye } from "lucide-react";

const TrustIndicators = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8  mb-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-center space-x-3">
        <CheckCircle className="h-8 w-8 text-green-500" />
        <div className="text-left">
          <div className="font-semibold text-gray-900">Verified Users</div>
          <div className="text-sm text-gray-600">
            Real identity verification
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-3">
        <Lock className="h-8 w-8 text-red-500" />
        <div className="text-left">
          <div className="font-semibold text-gray-900">Immutable Reviews</div>
          <div className="text-sm text-gray-600">
            Can't delete, only add updates
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center space-x-3">
        <Eye className="h-8 w-8 text-indigo-500" />
        <div className="text-left">
          <div className="font-semibold text-gray-900">Publicly Auditable</div>
          <div className="text-sm text-gray-600">
            Transparent review history
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustIndicators;
