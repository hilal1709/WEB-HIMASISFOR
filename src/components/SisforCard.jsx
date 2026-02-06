"use client"
import { useState } from "react";
import { ArrowDown } from "../icons/ArrowDown";

export default function SisforCard({
  title,
  subtitle,
  cardId,
  description,
  background,
}) {
  const [isVisible, setIsVisible] = useState(null);
  const cardVisibility = (cardId) => {
    setIsVisible(isVisible === cardId ? null : cardId);
  };
  return (
    <div className="w-full md:w-fit shadow-xl">
      {/* <h1 className="px-8 py-2 bg-red-600 rounded-t-xl font-medium text-center xl:text-lg text-white">
        {title}
      </h1> */}
      <div
        className={`flex flex-col justify-end w-full md:w-80 lg:w-96 2xl:w-[30rem] h-48 md:h-56 2xl:h-72 bg-cover rounded-xl ${background}`}
      >
        <div className="p-3 md:p-4 bg-gradient-to-b from-transparent to-zinc-700 text-white rounded-b-xl">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-xs md:text-sm">{subtitle}</h2>
            <button
              onClick={() => cardVisibility(cardId)}
              className="w-fit p-1 rounded-lg bg-white flex-shrink-0"
            >
              <ArrowDown
                className={`text-zinc-600 h-4 md:h-5 transition-transform duration-300 ${
                  isVisible === cardId ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              isVisible === cardId
                ? "max-h-40 md:max-h-48 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs mt-2 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
