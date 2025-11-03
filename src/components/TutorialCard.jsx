import React from "react";
import { Link } from "react-router-dom";

const difficultyMap = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700"
};

const TutorialCard = ({ id, thumbnailUrl, title, model, summary, difficulty, durationMinutes }) => (
  <Link to={`/tutorials/${id}`} className="block group">
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neutral-100 transition-transform group-hover:scale-[1.02]">
      <img
        src={thumbnailUrl}
        alt="Tutorial Thumbnail"
        className="w-full h-40 object-cover object-center bg-neutral-100"
      />
      <div className="p-5 flex flex-col gap-1">
        <h3 className="font-bold text-lg text-neutral-900 line-clamp-2">{title}</h3>
        {model && <div className="text-sm text-neutral-500">{model}</div>}
        {summary && <div className="my-1 text-sm text-neutral-700 line-clamp-2">{summary}</div>}
        <div className="flex items-center gap-3 mt-2">
          <span className={`px-3 py-1 text-xs rounded-xl font-medium ${difficultyMap[difficulty] || "bg-neutral-100 text-neutral-700"}`}>{difficulty}</span>
          <span className="text-xs text-neutral-400">{durationMinutes} min</span>
        </div>
      </div>
    </div>
  </Link>
);

export default TutorialCard;




