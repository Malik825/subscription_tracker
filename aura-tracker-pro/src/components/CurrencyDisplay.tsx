import { useSettings } from "@/hooks/use-settings";
import { useMemo } from 'react';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

/**
 * Component to display currency amounts with user's preferred currency
 * @param {number} amount - The amount to display
 * @param {string} className - Optional CSS classes
 * @param {boolean} showSymbol - Whether to show currency symbol (default: true)
 */
export default function CurrencyDisplay({ 
  amount, 
  className = '', 
  showSymbol = true 
}: CurrencyDisplayProps) {
  const { getCurrency, getCurrencySymbol } = useSettings();

  const formattedAmount = useMemo(() => {
    if (!amount && amount !== 0) return '-';

    const currency = getCurrency();
    const numAmount = Number(amount);

    // Format the number based on currency
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(numAmount));

    if (showSymbol) {
      const symbol = getCurrencySymbol();
      return numAmount < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
    }

    return numAmount < 0 ? `-${formatted}` : formatted;
  }, [amount, getCurrency, getCurrencySymbol, showSymbol]);

  return <span className={className}>{formattedAmount}</span>;
}