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
      <div>
        <motion.div
          layoutId={`card-${item.id}`}
          onClick={() => setSelected(true)}
        >
          <motion.img
            src={item.img}
            alt={item.title}
            className="mt-8 w-96 lg:w-full h-72 lg:h-160 shadow-xl rounded-xl cursor-pointer"
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
              className="fixed top-26 lg:top-24 left-4 lg:left-10 right-4 lg:right-10 z-50 bg-white rounded-xl overflow-hidden p-4 lg:p-2 shadow-xl lg:max-w-2xl 2xl:max-w-6xl lg:mx-auto flex flex-col justify-center items-center"
              layoutId={`card-${item.id}`}
            >
              <motion.img
                src={item.img}
                alt={item.title}
                className="w-100 lg:w-fit h-64 lg:h-116 2xl:h-200"
                layoutId={`image-${item.id}`}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
