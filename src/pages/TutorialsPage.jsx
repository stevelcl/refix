import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import TutorialCard from "../components/TutorialCard";
import SearchBar from "../components/SearchBar";

const CATEGORIES = ["All", "Phones", "Tablets", "Laptops", "Other"];
const ALL_MODELS = [
  "iPhone 13",
  "Galaxy S22",
  "Redmi Note",
  "iPad Pro",
  "Galaxy Tab",
  "Fire HD",
  "MacBook Air",
  "Dell XPS",
  "ThinkPad",
  "Switch",
  "PS5",
  "Xbox"
];

const TutorialsPage = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [model, setModel] = useState("");
  const [search, setSearch] = useState("");
  const [params] = useSearchParams();

  useEffect(() => {
    let catFromQ = params.get("category");
    let modelFromQ = params.get("model");
    let searchFromQ = params.get("search");
    if (catFromQ) setCategory(catFromQ);
    if (modelFromQ) setModel(modelFromQ);
    if (searchFromQ) setSearch(searchFromQ);
  }, [params]);

  useEffect(() => {
    async function fetchGuides() {
      setLoading(true);
      let q = collection(db, "tutorials");
      let filters = [];
      if (category !== "All") filters.push(where("category", "==", category));
      if (model) filters.push(where("model", "==", model));
      if (filters.length > 0) q = query(q, ...filters);
      const snapshot = await getDocs(q);
      let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (search) {
        items = items.filter(g =>
          (g.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
          (g.model?.toLowerCase() || "").includes(search.toLowerCase())
        );
      }
      setGuides(items);
      setLoading(false);
    }
    fetchGuides();
  }, [category, model, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-4 mb-7 items-center">
        <div className="flex gap-3 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`px-4 py-2 rounded-full text-sm border font-medium transition ${category === c ? "bg-blue-600 text-white border-blue-600" : "bg-white border-neutral-200 text-neutral-700 hover:bg-blue-100"}`}
              onClick={() => {
                setCategory(c);
                setModel("");
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="input md:w-48 w-full text-sm"
        >
          <option value="">All Models</option>
          {ALL_MODELS.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <div className="flex-1 md:ml-4 w-full">
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by model or guide…" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full text-neutral-400">Loading guides…</div>
        ) : guides.length === 0 ? (
          <div className="col-span-full text-neutral-400">No guides found.</div>
        ) : (
          guides.map(guide => (
            <TutorialCard key={guide.id} id={guide.id} {...guide} summary={guide.summary} />
          ))
        )}
      </div>
    </div>
  );
};

export default TutorialsPage;


