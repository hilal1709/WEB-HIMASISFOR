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
    <div className="w-fit shadow-xl">
      {/* <h1 className="px-8 py-2 bg-red-600 rounded-t-xl font-medium text-center xl:text-lg text-white">
        {title}
      </h1> */}
      <div
        className={`flex flex-col justify-end w-96 2xl:w-[30rem] h-56 2xl:h-72 bg-cover rounded-xl ${background}`}
      >
        <div className="p-4 bg-gradient-to-b from-transparent to-zinc-700 text-white rounded-b-xl">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-sm">{subtitle}</h2>
            <button
              onClick={() => cardVisibility(cardId)}
              className="w-fit p-1 rounded-lg bg-white"
            >
              <ArrowDown
                className={`text-zinc-600 h-5 transition-transform duration-300 ${
                  isVisible === cardId ? "rotate-0" : "rotate-180"
                }`}
              />
            </button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-500 ${
              isVisible === cardId
                ? "max-h-40 opacity-100"
                : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-xs mt-2">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
