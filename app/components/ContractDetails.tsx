// External Modules
import { useState } from "react";
import { Copy } from "lucide-react";

interface ContractDetailsProps {
  name: string;
  value: string;
  copy?: string;
}

export default function ContractDetails({ name, value, copy }: ContractDetailsProps) {
  // Set the state of copy text
  const [copied, setCopied] = useState(false);

  const handleCopy = (item: string) => {
    navigator.clipboard.writeText(item).then(() => {
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    });
  };

  return (
    <div className="flex">
      <p className="text-slate-400">{name}</p>
      <div className="ml-auto flex items-center">
        <p> {value} </p>
        {copy && (
          <button
            data-tip={copied ? "Copied!" : "Copy"}
            className="pointer daisy-tooltip daisy-tooltip-primary ml-1"
            onClick={() => handleCopy(copy)}
            type="button"
          >
            <Copy size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
