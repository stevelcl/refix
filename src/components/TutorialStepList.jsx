import React from "react";

const TutorialStepList = ({ steps, thumbnailUrl }) => (
  <div className="mt-6">
    {steps?.length > 0 && (
      <ol className="space-y-6">
        {steps.map((step, i) => (
          <li
            key={i}
            className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                    STEP {i + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-base text-neutral-800 leading-relaxed">{step}</p>
                </div>
              </div>
              {thumbnailUrl && i < 3 && (
                <div className="mt-4">
                  <img
                    src={thumbnailUrl}
                    alt={`Step ${i + 1} illustration`}
                    className="w-full max-w-md rounded-lg mx-auto"
                  />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    )}
  </div>
);

export default TutorialStepList;




