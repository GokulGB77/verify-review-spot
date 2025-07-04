import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSectionMinimal = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="py-16 px-4 text-center bg-white">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
        Find <span className="text-blue-600">Real Reviews</span>
      </h1>
      <p className="text-gray-600 mb-8 max-w-xl mx-auto">
        Honest, verified experiences. No clutter. No noise. Just what matters.
      </p>
      <div className="flex max-w-md mx-auto gap-2">
        <Input
          placeholder="Search entities..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="h-11 text-base"
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} className="h-11 px-6">Search</Button>
      </div>
    </section>
  );
};

export default HeroSectionMinimal;
