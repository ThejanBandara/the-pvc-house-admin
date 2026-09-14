import { ShoppingCart } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function SalesPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Sales</h1>
          <div className="page-subtitle">Revenue and transaction reporting</div>
        </div>
      </div>
      <ComingSoon
        icon={ShoppingCart}
        title="Sales reporting is coming soon"
        description="This section will populate once the POS system goes live. The database is already set up to track sales, so no data will be lost — reports will appear here automatically."
      />
    </div>
  );
}
