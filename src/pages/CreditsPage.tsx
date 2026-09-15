import { CreditCard } from "lucide-react";
import ComingSoon from "../components/ComingSoon";

export default function CreditsPage() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-[18px] flex-wrap">
        <div>
          <h1 className="m-0 text-[22px] font-extrabold tracking-[-0.3px]">Credits</h1>
          <div className="text-[var(--text-muted)] text-[13px] mt-[2px]">Customer credit accounts and balances</div>
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
