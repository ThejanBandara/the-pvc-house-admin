import { ShoppingCart } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function SalesPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-[18px] flex-wrap">
        <div>
          <h1 className="m-0 text-[22px] font-extrabold tracking-[-0.3px]">Sales</h1>
          <div className="text-[var(--text-muted)] text-[13px] mt-[2px]">Revenue and transaction reporting</div>
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
