import { CreditCard } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function CreditsPage() {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Credits</h1>
          <div className="page-subtitle">Customer credit accounts and balances</div>
        </div>
      </div>
      <ComingSoon
        icon={CreditCard}
        title="Credit tracking is coming soon"
        description="Customer credit accounts and outstanding balances will show here once sales go through the POS. The database is already in place for this."
      />
    </div>
  );
}
