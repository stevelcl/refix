import React from "react";
import { AlertTriangle, Info, Link as LinkIcon } from "lucide-react";

const TutorialStepList = ({ steps, thumbnailUrl }) => {
  // Handle both legacy format (string array) and new format (object array)
  const normalizeSteps = (steps) => {
    if (!steps || steps.length === 0) return [];
    
    return steps.map((step, index) => {
      // Legacy format: step is a string
      if (typeof step === "string") {
        return {
          number: index + 1,
          title: "",
          description: step,
          images: [],
          warnings: [],
          tips: [],
          tools: [],
          parts: []
        };
      }
      
      // New format: step is an object
      return {
        number: step.number || index + 1,
        title: step.title || "",
        description: step.description || "",
        images: step.images || [],
        warnings: step.warnings || [],
        tips: step.tips || [],
        tools: step.tools || [],
        parts: step.parts || []
      };
    });
  };

  const normalizedSteps = normalizeSteps(steps);

  return (
    <div className="mt-6">
      {normalizedSteps.length > 0 && (
        <ol className="space-y-8">
          {normalizedSteps.map((step, i) => (
            <li
              key={i}
              className="bg-white rounded-xl shadow-md border border-neutral-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Step Header */}
                <div className="flex items-start gap-6 mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1">
                    {step.title && (
                      <h3 className="font-bold text-xl text-neutral-900 mb-2">{step.title}</h3>
                    )}
                    {step.description && (
                      <p className="text-base text-neutral-800 leading-relaxed whitespace-pre-wrap">
                        {step.description}
                      </p>
                    )}
                    {!step.title && !step.description && typeof steps[i] === "string" && (
                      <p className="text-base text-neutral-800 leading-relaxed">{steps[i]}</p>
                    )}
                  </div>
                </div>

                {/* Images */}
                {step.images && step.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {step.images.map((url, imgIndex) => (
                      <div key={imgIndex} className="relative">
                        <img
                          src={url}
                          alt={`Step ${step.number} image ${imgIndex + 1}`}
                          className="w-full rounded-lg shadow-sm border border-neutral-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Fallback to thumbnailUrl for legacy format */}
                {(!step.images || step.images.length === 0) && thumbnailUrl && i < 3 && (
                  <div className="mt-4">
                    <img
                      src={thumbnailUrl}
                      alt={`Step ${step.number} illustration`}
                      className="w-full max-w-md rounded-lg mx-auto"
                    />
                  </div>
                )}

                {/* Warnings */}
                {step.warnings && step.warnings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {step.warnings.map((warning, warnIndex) => (
                      <div
                        key={warnIndex}
                        className="flex items-start gap-3 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg"
                      >
                        <AlertTriangle size={20} className="text-orange-600 flex-shrink-0 mt-0.5" />
                        <p className="text-orange-800 font-medium">{warning}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tips */}
                {step.tips && step.tips.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {step.tips.map((tip, tipIndex) => (
                      <div
                        key={tipIndex}
                        className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg"
                      >
                        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-800">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tools */}
                {step.tools && step.tools.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon size={18} className="text-green-600" />
                      <span className="font-semibold text-green-900">Required Tools</span>
                    </div>
                    <ul className="space-y-1">
                      {step.tools.map((tool, toolIndex) => {
                        const toolName = typeof tool === "string" ? tool : tool.name;
                        const toolUrl = typeof tool === "object" ? tool.url : null;
                        return (
                          <li key={toolIndex} className="text-green-900">
                            {toolUrl ? (
                              <a
                                href={toolUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-green-700"
                              >
                                {toolName}
                              </a>
                            ) : (
                              toolName
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Parts */}
                {step.parts && step.parts.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon size={18} className="text-purple-600" />
                      <span className="font-semibold text-purple-900">Required Parts</span>
                    </div>
                    <ul className="space-y-1">
                      {step.parts.map((part, partIndex) => {
                        const partName = typeof part === "string" ? part : part.name;
                        const partUrl = typeof part === "object" ? part.url : null;
                        return (
                          <li key={partIndex} className="text-purple-900">
                            {partUrl ? (
                              <a
                                href={partUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-purple-700"
                              >
                                {partName}
                              </a>
                            ) : (
                              partName
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
      {normalizedSteps.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <p>No step instructions available</p>
        </div>
      )}
    </div>
  );
};

export default TutorialStepList;
