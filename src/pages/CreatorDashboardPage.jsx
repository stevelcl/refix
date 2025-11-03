import React, { useCallback, useEffect, useState } from "react";
import { listTutorials, createTutorial, updateTutorial } from "../azure";
import { useSite } from "../context/SiteContext";
import CreatorDashboardForm from "../components/CreatorDashboardForm";
import CreatorGuideTable from "../components/CreatorGuideTable";

const CreatorDashboardPage = () => {
  const { isCreatorAuthed, loginAsCreator } = useSite();
  const [password, setPassword] = useState("");
  const [allGuides, setAllGuides] = useState([]);
  const [editingGuide, setEditingGuide] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchGuides = useCallback(async () => {
    const items = await listTutorials();
    setAllGuides(items || []);
  }, []);

  useEffect(() => { if (isCreatorAuthed) fetchGuides(); }, [isCreatorAuthed, fetchGuides]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginAsCreator(password)) {
      setMessage("Wrong password.");
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    if (editingGuide) {
      await updateTutorial(editingGuide.id, data);
      setMessage("Guide updated.");
    } else {
      await createTutorial(data);
      setMessage("Guide published.");
    }
    setEditingGuide(null);
    await fetchGuides();
    setLoading(false);
  };

  if (!isCreatorAuthed) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 max-w-sm w-full flex flex-col gap-4">
          <div className="font-bold text-xl text-neutral-900 mb-1">Enter Internal Dashboard</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Internal password"
            className="input"
            autoFocus
          />
          <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition">Enter Dashboard</button>
          {message && <div className="text-red-600 text-sm mt-1">{message}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-neutral-50 px-2 py-8 sm:py-12 flex flex-col gap-8">
      <div className="max-w-2xl mx-auto w-full">
        <CreatorDashboardForm
          initialValues={editingGuide}
          onSubmit={handleSubmit}
          editing={!!editingGuide}
          loading={loading}
        />
        {message && <div className="text-green-700 text-center mt-2">{message}</div>}
      </div>
      <div className="max-w-4xl mx-auto w-full">
        <CreatorGuideTable guides={allGuides} onEdit={setEditingGuide} />
      </div>
    </div>
  );
};

export default CreatorDashboardPage;
