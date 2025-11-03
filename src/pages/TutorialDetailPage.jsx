import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTutorial } from "../azure";
import TutorialStepList from "../components/TutorialStepList";
import Breadcrumb from "../components/Breadcrumb";

const difficultyColor = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-yellow-100 text-yellow-700",
  Advanced: "bg-red-100 text-red-700"
};

const TutorialDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      const item = await getTutorial(id);
      if (item) setData(item);
    };
    fetchGuide();
  }, [id]);

  if (!data)
    return <div className="max-w-7xl mx-auto px-6 py-14 text-neutral-400">Loading…</div>;

  // Build breadcrumb based on data
  const breadcrumbItems = [
    { label: "Device", to: "/" },
    { label: data.category || "Tutorial" },
    { label: data.title }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-neutral-900 mb-4">{data.title}</h1>
        <div className="flex flex-wrap items-center gap-3 mb-6 text-sm text-neutral-500">
          <span>{data.category}</span>
          {data.model && <span>· {data.model}</span>}
          {data.difficulty && (
            <span className={`px-3 py-1 rounded-xl font-medium text-xs ${difficultyColor[data.difficulty]}`}>
              {data.difficulty}
            </span>
          )}
          {data.durationMinutes && (
            <span>· {data.durationMinutes} min</span>
          )}
        </div>
        {data.summary && (
          <div className="mb-8 text-lg text-neutral-800">{data.summary}</div>
        )}
        {data.videoUrl && (
          <div className="mb-8 rounded-xl overflow-hidden bg-neutral-100 aspect-video max-w-4xl">
            <iframe
              src={data.videoUrl}
              title="Video"
              frameBorder={0}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64 md:h-96"
            />
          </div>
        )}
        {data.tools?.length > 0 && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-xl p-5 max-w-4xl">
            <div className="font-semibold mb-2 text-blue-900">Tools You'll Need</div>
            <ul className="list-disc pl-6">
              {data.tools.map((tool, i) => (
                <li key={i} className="text-blue-900 mb-1">{tool}</li>
              ))}
            </ul>
          </div>
        )}
        <TutorialStepList steps={data.steps} thumbnailUrl={data.thumbnailUrl} />
      </div>
    </div>
  );
};

export default TutorialDetailPage;




