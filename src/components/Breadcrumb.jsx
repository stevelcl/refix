import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumb = ({ items }) => {
  return (
    <nav className="bg-white border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <ChevronRight className="w-4 h-4 text-neutral-400" />}
              {item.to ? (
                <Link to={item.to} className="hover:text-blue-600 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className={index === items.length - 1 ? "text-neutral-900 font-medium" : ""}>
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;

