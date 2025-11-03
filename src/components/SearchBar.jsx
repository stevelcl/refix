import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="flex items-center bg-white border border-neutral-200 rounded-full px-4 py-2 shadow-sm w-full max-w-xl">
    <Search className="w-5 h-5 text-neutral-400 mr-3" />
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="flex-1 outline-none bg-transparent text-base text-neutral-800 placeholder-neutral-400"
      autoComplete="off"
    />
  </div>
);

export default SearchBar;




