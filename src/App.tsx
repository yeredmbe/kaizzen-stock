import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import Dashboard from "./components/Dashboard";
import ProductTable from "./components/ProductTable";
import ProductForm from "./components/ProductForm";
import ProductDetail from "./components/ProductDetail";
import ThemeToggle from "./components/ThemeToggle";

type View =
  | { name: "list" }
  | { name: "new" }
  | { name: "edit"; id: Id<"products"> }
  | { name: "detail"; id: Id<"products"> };

export default function App() {
  const [view, setView] = useState<View>({ name: "list" });

  return (
    <div className="min-h-screen bg-ledger-bg dark:bg-ledger-dark-bg">
      <header className="border-b border-ledger-line bg-ledger-panel dark:border-ledger-dark-line dark:bg-ledger-dark-panel">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-ledger-gold dark:text-ledger-dark-gold">
              Kaizzen
            </p>
            <h1 className="font-display text-lg sm:text-2xl font-semibold text-ledger-ink truncate dark:text-ledger-dark-ink">
              Product Ledger
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {view.name === "list" ? (
            <button
              onClick={() => setView({ name: "new" })}
              className="shrink-0 rounded-sm bg-ledger-ink px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-ledger-inkSoft transition-colors"
            >
              + Add
            </button>
            ) : (
              <button
                onClick={() => setView({ name: "list" })}
                className="shrink-0 text-sm font-medium text-ledger-inkSoft hover:text-ledger-ink dark:text-ledger-dark-inkSoft dark:hover:text-ledger-dark-ink"
              >
                ← Back
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-8">
        {view.name === "list" && (
          <>
            <Dashboard />
            <ProductTable
              onView={(id) => setView({ name: "detail", id })}
              onEdit={(id) => setView({ name: "edit", id })}
            />
          </>
        )}
        {view.name === "new" && (
          <ProductForm onDone={() => setView({ name: "list" })} />
        )}
        {view.name === "detail" && (
          <ProductDetail
            productId={view.id}
            onEdit={(id) => setView({ name: "edit", id })}
            onBack={() => setView({ name: "list" })}
          />
        )}
        {view.name === "edit" && (
          <ProductForm
            productId={view.id}
            onDone={() => setView({ name: "list" })}
          />
        )}
      </main>
    </div>
  );
}
