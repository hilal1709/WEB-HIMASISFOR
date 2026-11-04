"use client"
import { useState } from "react";
import Modal from "@/components/ds/Modal";

/** Gambar "Body of Knowledge" yang bisa diperbesar memakai Modal Sisfor DS. */
export default function KnowledgeImg() {
  const [selected, setSelected] = useState(false);
  const item = { title: "Body of Knowledge", img: "/img/knowledge.png" };

  return (
    <>
      <div className="px-4">
        <button type="button" onClick={() => setSelected(true)} className="group block w-full cursor-zoom-in" aria-label="Perbesar gambar Body of Knowledge">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.img}
            alt={item.title}
            className="mt-6 md:mt-7 lg:mt-8 w-full md:w-[32rem] lg:w-96 xl:w-full h-48 md:h-56 lg:h-72 xl:h-160 rounded-xl shadow-xl transition-transform duration-500 ease-brand group-hover:scale-[1.02]"
          />
        </button>
      </div>

      <Modal open={selected} onOpenChange={setSelected} title={item.title} size="xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.img} alt={item.title} className="mx-auto h-auto max-h-[75vh] w-auto rounded-lg" />
      </Modal>
    </>
  );
}
