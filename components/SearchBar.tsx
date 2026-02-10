"use client";

import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export function SearchBar({ onSearch, isSearching }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto mb-8">
      <div className={cn(
        "relative flex items-center bg-white rounded-full border transition-all duration-300 ease-out",
        isFocused ? "shadow-lg border-accent ring-2 ring-accent/20" : "shadow-sm border-transparent"
      )}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask Sam..."
          className="w-full bg-transparent py-3 pl-5 pr-12 rounded-full outline-none text-primary placeholder:text-gray-400"
        />
        <button 
          type="submit"
          className="absolute right-2 p-2 rounded-full hover:bg-muted transition-colors text-gray-500"
          disabled={isSearching}
        >
          {isSearching ? <Loader2 className="w-5 h-5 animate-spin text-accent" /> : <Search className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
}
