import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const FeedbackPage = () => {
  const [form, setForm] = useState({ name: "", request: "", comments: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await addDoc(collection(db, "feedback"), {
      name: form.name,
      request: form.request,
      comments: form.comments,
      timestamp: serverTimestamp()
    });
    setLoading(false);
    setForm({ name: "", request: "", comments: "" });
    setSubmitted(true);
  };

  if (submitted)
    return (
      <div className="flex justify-center items-center min-h-[55vh]">
        <div className="bg-white max-w-md w-full rounded-2xl p-8 shadow-lg border border-neutral-100 text-center">
          <div className="font-bold text-2xl text-neutral-900 mb-2">Thank you!</div>
          <div className="text-neutral-500">Your feedback will help us choose what guides to build next.<br />— The ReFix Team</div>
        </div>
      </div>
    );

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-md w-full shadow-lg border border-neutral-100 p-8 flex flex-col gap-3">
        <h1 className="font-bold text-2xl mb-2 text-neutral-900">Help us decide what to fix next.</h1>
        <input type="text" required name="name" value={form.name} onChange={handleChange} placeholder="Your Name" className="input" />
        <input type="text" required name="request" value={form.request} onChange={handleChange} placeholder="Which device or model do you want a repair guide for?" className="input" />
        <textarea name="comments" value={form.comments} onChange={handleChange} placeholder="Optional comments" className="input min-h-[64px]" />
        <button type="submit" disabled={loading} className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl shadow transition disabled:opacity-60 disabled:cursor-wait">
          {loading ? "Submitting…" : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;




