"use client"
import Erp from "../icons/Erp";
import { ArrowDown } from "../icons/ArrowDown";
import Auditor from "../icons/Auditor";
import Consultant from "../icons/Consultant";
import Analyst from "../icons/Analyst";
import { useState, useEffect } from "react";
import { motion } from "motion/react";

export default function CareerSection() {
  const [activeCareer, setActiveCareer] = useState("erp");
  const [careerData, setCareerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch career data from API
  useEffect(() => {
    async function fetchCareerData() {
      try {
        const response = await fetch('/api/content?section=career');
        if (response.ok) {
          const data = await response.json();
          setCareerData(data);
        }
      } catch (error) {
        console.error('Error fetching career data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchCareerData();
  }, []);

  if (loading || !careerData) {
    return (
      <div className="flex justify-center items-center my-24">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  const { title, data } = careerData;
  const careers = data?.careers || [];

  return (
    <>
      <div className="flex flex-col justify-center items-center my-12 md:my-16 lg:my-24 px-4 md:px-8 lg:px-24 2xl:px-48">
        {/* container wrapper */}
        <div className="w-full max-w-7xl flex flex-col md:flex-row justify-center items-center gap-8 md:gap-10 lg:gap-12">
          {/* bagian kiri */}
          <div className="w-full lg:w-fit">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-center lg:text-left lg:w-[42rem]" dangerouslySetInnerHTML={{ __html: title || "Prospek Karir Lulusan <br /><span class='text-transparent bg-clip-text bg-gradient-to-r from-red-700 to-red-500'>Sistem Informasi UISI</span>" }}>
            </h1>

          {/* section karir lulusan */}
          <div className="flex flex-col gap-3 md:gap-4 mt-8 md:mt-10 lg:mt-12 w-full">
            {careers.map((career) => {
              const IconComponent = 
                career.id === 'erp' ? Erp :
                career.id === 'auditor' ? Auditor :
                career.id === 'consultant' ? Consultant :
                Analyst;
              
              const isFillIcon = ['auditor', 'consultant', 'analyst'].includes(career.id);
              
              return (
                <button
                  key={career.id}
                  onClick={() => setActiveCareer(career.id)}
                  className={`flex justify-between items-center p-3 md:p-4 rounded-lg transition-colors ${
                    activeCareer === career.id ? "bg-zinc-100" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div
                      className={`p-1.5 md:p-2 rounded-full ${
                        activeCareer === career.id
                          ? "bg-red-600 outline-8 outline-zinc-200"
                          : "bg-zinc-200"
                      }`}
                    >
                      <IconComponent
                        className={`h-5 md:h-6 ${
                          activeCareer === career.id
                            ? isFillIcon ? "fill-white" : "text-white"
                            : isFillIcon ? "fill-zinc-500" : "text-zinc-500"
                        }`}
                      />
                    </div>
                    <h2 className="font-medium text-sm md:text-base">{career.title}</h2>
                  </div>
                  <ArrowDown className="h-5 md:h-6 lg:-rotate-90 text-zinc-500 flex-shrink-0" />
                </button>
              );
            })}
          </div>
          {/* end button */}
        </div>

        {/* bagian kanan */}
        {careers.find(c => c.id === activeCareer) && (
          <motion.div
            key={activeCareer}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full"
          >
            <img
              src={careers.find(c => c.id === activeCareer).image}
              alt="bidangkeahlian"
              className="border-3 border-white drop-shadow-lg rounded-2xl w-full h-auto"
            />
            <p className="w-full lg:w-[36rem] mt-5 md:mt-6 lg:mt-7 text-xs md:text-sm lg:text-base text-zinc-600">
              {careers.find(c => c.id === activeCareer).description}
            </p>
          </motion.div>
        )}

        {/* end section karir lulusan */}
        </div>
      </div>
    </>
  );
}
