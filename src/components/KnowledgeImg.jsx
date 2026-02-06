"use client"
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FramerImg() {
  const [selected, setSelected] = useState(false);

  const item = {
    id: "unique",
    title: "Body of Knowledge",
    category: "Food",
    img: "img/knowledge.png",
  };

  return (
    <>
      <div className="px-4">
        <motion.div
          layoutId={`card-${item.id}`}
          onClick={() => setSelected(true)}
        >
          <motion.img
            src={item.img}
            alt={item.title}
            className="mt-6 md:mt-7 lg:mt-8 w-full md:w-[32rem] lg:w-96 xl:w-full h-48 md:h-56 lg:h-72 xl:h-160 shadow-xl rounded-xl cursor-pointer"
            layoutId={`image-${item.id}`}
          />
        </motion.div>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed top-0 left-0 w-full h-full bg-black z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(false)}
            />
            <motion.div
              className="fixed top-20 md:top-24 lg:top-26 left-4 md:left-6 lg:left-10 right-4 md:right-6 lg:right-10 z-50 bg-white rounded-xl overflow-hidden p-3 md:p-4 lg:p-2 shadow-xl lg:max-w-2xl 2xl:max-w-6xl lg:mx-auto flex flex-col justify-center items-center"
              layoutId={`card-${item.id}`}
            >
              <motion.img
                src={item.img}
                alt={item.title}
                className="w-full md:w-96 lg:w-100 xl:w-fit h-auto md:h-80 lg:h-96 xl:h-116 2xl:h-200"
                layoutId={`image-${item.id}`}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
