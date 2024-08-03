// External Modules
import { useState } from "react";

// Components
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

interface BurnTokenCardProps {
  title: string;
  desc: string;
}

function BurnTokenCard({ title, desc }: BurnTokenCardProps) {
  // Record the mint amount, used by both the slider and input
  const [burnAmount, setBurnAmount] = useState(0);

  /**
   * Handle mint input change
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let value = inputValue.replace(/[^0-9.]/g, ""); // Allow only numeric and decimal values
    let num = Number(value);

    // if (num > maxTokenPerMint) num = maxTokenPerMint;

    setBurnAmount(num);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className="rounded-xl bg-background p-4" onSubmit={handleSubmit}>
      <h4>{title}</h4>
      <Input
        type="text"
        placeholder="0"
        className="focus !focus-visible:!shadow-none my-2 !border-none !bg-transparent pl-0 text-4xl font-medium
          text-amber-500 outline-none !ring-transparent placeholder:text-amber-500 focus-visible:!border-none
          focus-visible:!outline-none focus-visible:!ring-offset-0"
        // maxLength={maxTokenPerMint.toString().length}
        // max={maxTokenPerMint}
        value={burnAmount}
        onChange={handleInputChange}
      />
      <p className="text-slate-400">{desc}</p>
      <Button type="submit" variant="orange" size="lg" className="mt-10 w-full">
        Burn Token
      </Button>
    </form>
  );
}

export default BurnTokenCard;
