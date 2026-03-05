import { fetchData } from "./fetchData";
import DividendTable from "../../components/DividendTable";

export default async function InfoPage() {
  const dividends = await fetchData();

  return (
    <main className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      <div className="w-full mx-auto px-4 sm:px-6 pt-24 pb-16 md:pt-32 md:pb-24">
        
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Dividend Intelligence
          </h1>
          <p className="text-neutral-400 max-w-2xl text-lg">
            A consolidated view of upcoming dividends. We bypass face-value marketing and calculate the true yield based on the stock price.
          </p>
        </header>

        {/* Client Interactive Table */}
        <DividendTable initialDividends={dividends} />

      </div>
    </main>
  );
}
