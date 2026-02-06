"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContentManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [contents, setContents] = useState({});

  // Fetch all content sections
  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch("/api/content");
        if (response.ok) {
          const data = await response.json();
          const contentBySection = data.reduce((acc, item) => {
            acc[item.section] = item;
            return acc;
          }, {});
          setContents(contentBySection);
        } else {
          setMessage({ type: "error", text: "Gagal memuat konten" });
        }
      } catch (error) {
        console.error("Error fetching contents:", error);
        setMessage({ type: "error", text: "Error memuat konten" });
      } finally {
        setLoading(false);
      }
    }
    fetchContents();
  }, []);

  const handleSave = async (section, updatedData) => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          ...updatedData,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setContents((prev) => ({
          ...prev,
          [section]: data,
        }));
        setMessage({ type: "success", text: "Konten berhasil disimpan!" });
        
        // Refresh halaman setelah 1 detik
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan konten" });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      setMessage({ type: "error", text: "Error menyimpan konten" });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "about", label: "Tentang Kami" },
    { id: "bidang-keahlian", label: "Bidang Keahlian" },
    { id: "career", label: "Prospek Karir" },
    { id: "testimoni", label: "Testimoni Alumni" },
    { id: "jumbotron-promo", label: "Jumbotron Promo" },
    { id: "social-media", label: "Social Media" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Content Management System
          </h1>
          <p className="mt-2 text-gray-600">
            Kelola konten halaman utama website
          </p>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-red-600 text-red-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "hero" && (
              <HeroEditor
                data={contents.hero}
                onSave={(data) => handleSave("hero", data)}
                saving={saving}
              />
            )}
            {activeTab === "about" && (
              <AboutEditor
                data={contents.about}
                onSave={(data) => handleSave("about", data)}
                saving={saving}
              />
            )}
            {activeTab === "bidang-keahlian" && (
              <BidangKeahlianEditor
                data={contents["bidang-keahlian"]}
                onSave={(data) => handleSave("bidang-keahlian", data)}
                saving={saving}
              />
            )}
            {activeTab === "career" && (
              <CareerEditor
                data={contents.career}
                onSave={(data) => handleSave("career", data)}
                saving={saving}
              />
            )}
            {activeTab === "testimoni" && (
              <TestimoniEditor
                data={contents.testimoni}
                onSave={(data) => handleSave("testimoni", data)}
                saving={saving}
              />
            )}
            {activeTab === "jumbotron-promo" && (
              <JumbotronPromoEditor
                data={contents["jumbotron-promo"]}
                onSave={(data) => handleSave("jumbotron-promo", data)}
                saving={saving}
              />
            )}
            {activeTab === "social-media" && (
              <SocialMediaEditor
                data={contents["social-media"]}
                onSave={(data) => handleSave("social-media", data)}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Section Editor
function HeroEditor({ data, onSave, saving }) {
  const defaultData = {
    badge: "",
    buttons: [
      { text: "", url: "", type: "primary" },
      { text: "", url: "", type: "secondary" },
    ],
    akreditasi: {
      image: "",
      title: "",
      description: "",
    },
  };

  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
    data: data?.data && typeof data.data === 'object' ? data.data : defaultData,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
        data: data.data && typeof data.data === 'object' ? data.data : defaultData,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateDataField = (path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current = newData.data;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul Utama (gunakan &lt;span class='text-red-600'&gt; untuk teks merah)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Program Studi <span class='text-red-600'>Sistem Informasi UISI</span>"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Badge
        </label>
        <input
          type="text"
          value={formData.data.badge}
          onChange={(e) => updateDataField("badge", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="SISFOR UISI"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Deskripsi singkat tentang program studi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Gambar Hero
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="/img/heroPict.png"
        />
      </div>

      {/* Buttons */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Tombol CTA</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tombol Primary - Teks
            </label>
            <input
              type="text"
              value={formData.data.buttons[0].text}
              onChange={(e) => updateDataField("buttons.0.text", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Hubungi Kami"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tombol Primary - URL
            </label>
            <input
              type="text"
              value={formData.data.buttons[0].url}
              onChange={(e) => updateDataField("buttons.0.url", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://s.id/DaftarSisforUISI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tombol Secondary - Teks
            </label>
            <input
              type="text"
              value={formData.data.buttons[1].text}
              onChange={(e) => updateDataField("buttons.1.text", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Video Profile"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tombol Secondary - URL
            </label>
            <input
              type="text"
              value={formData.data.buttons[1].url}
              onChange={(e) => updateDataField("buttons.1.url", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      {/* Akreditasi */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Info Akreditasi</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Logo Akreditasi
            </label>
            <input
              type="text"
              value={formData.data.akreditasi.image}
              onChange={(e) => updateDataField("akreditasi.image", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="/img/akreditasi.png"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Akreditasi (gunakan HTML untuk styling)
            </label>
            <input
              type="text"
              value={formData.data.akreditasi.title}
              onChange={(e) => updateDataField("akreditasi.title", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder='Terakreditasi <span class="font-semibold text-red-600">"Baik Sekali"</span>'
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi Akreditasi
            </label>
            <input
              type="text"
              value={formData.data.akreditasi.description}
              onChange={(e) => updateDataField("akreditasi.description", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="LAM INFOKOM No.026/SK/LAM-INFOKOM/Ak/S/IV/2023."
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// About Section Editor
function AboutEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Sistem Informasi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Universitas Internasional Semen Indonesia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi (gunakan dua baris kosong untuk paragraf baru)
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Paragraf 1...&#10;&#10;Paragraf 2..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Bidang Keahlian Editor
function BidangKeahlianEditor({ data, onSave, saving }) {
  const defaultItems = [
    {
      title: 'IT Audit / Governance',
      subtitle: 'Apa itu IT / Audit & Governance ?',
      cardId: 'audit',
      description: 'Belajar mengenai bagaimana meningkatkan kemampuan organisasi untuk mencapai tujuan dan sasaran keseluruhannya, dan bagaimana mengevaluasi implementasi tata kelola TI',
      background: 'bg-[url(/img/governance.jpeg)]'
    },
    {
      title: 'Enterprise System',
      subtitle: 'Apa itu Enterprise System ?',
      cardId: 'erp',
      description: 'Belajar mengenai sistem informasi lintas fungsi yang menyediakan integrasi proses bisnis utama dan membantu dalam perencanaan sumber daya organisasi.',
      background: 'bg-[url(/img/erp.jpeg)]'
    },
    {
      title: 'Data Science',
      subtitle: 'Apa itu Data Science ?',
      cardId: 'data',
      description: 'Belajar mengenai bagaimana menerapkan prinsip dan teknik penanganan data untuk memberikan informasi yang berarti dan mendukung pengambilan keputusan dalam suatu organisasi.',
      background: 'bg-[url(/img/data.jpeg)]'
    }
  ];

  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    data: Array.isArray(data?.data) ? data.data : defaultItems,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        data: Array.isArray(data.data) ? data.data : defaultItems,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateBidangItem = (index, field, value) => {
    const newData = [...formData.data];
    newData[index] = { ...newData[index], [field]: value };
    setFormData({ ...formData, data: newData });
  };

  const addBidangItem = () => {
    const newItem = {
      title: '',
      subtitle: '',
      cardId: `item-${formData.data.length + 1}`,
      description: '',
      background: 'bg-[url(/img/governance.jpeg)]'
    };
    setFormData({ ...formData, data: [...formData.data, newItem] });
  };

  const removeBidangItem = (index) => {
    if (formData.data.length > 1) {
      const newData = formData.data.filter((_, i) => i !== index);
      setFormData({ ...formData, data: newData });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul (gunakan HTML untuk styling)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder='Bidang Keahlian <br /><span class="text-red-600">Sistem Informasi UISI</span>'
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle
        </label>
        <textarea
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Deskripsi bidang keahlian"
        />
      </div>

      {/* Bidang Keahlian Items */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Daftar Bidang Keahlian</h3>
          <button
            type="button"
            onClick={addBidangItem}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            + Tambah Bidang Keahlian
          </button>
        </div>
        
        {formData.data.map((item, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Bidang Keahlian {index + 1}</h4>
              {formData.data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBidangItem(index)}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                >
                  Hapus
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Judul</label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateBidangItem(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="IT Audit / Governance"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateBidangItem(index, "subtitle", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Apa itu IT / Audit & Governance ?"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Card ID</label>
                <input
                  type="text"
                  value={item.cardId || ''}
                  onChange={(e) => updateBidangItem(index, "cardId", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="audit"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi</label>
                <textarea
                  value={item.description || ''}
                  onChange={(e) => updateBidangItem(index, "description", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Deskripsi bidang keahlian..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Background CSS Class</label>
                <input
                  type="text"
                  value={item.background || ''}
                  onChange={(e) => updateBidangItem(index, "background", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="bg-[url(/img/governance.jpeg)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Career Section Editor
function CareerEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    data: data?.data?.careers ? { careers: data.data.careers } : { careers: [] },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        data: data?.data?.careers ? { careers: data.data.careers } : { careers: [] },
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateCareerItem = (index, field, value) => {
    const newCareers = [...formData.data.careers];
    newCareers[index] = { ...newCareers[index], [field]: value };
    setFormData({
      ...formData,
      data: { ...formData.data, careers: newCareers },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul (gunakan HTML untuk styling)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Prospek Karir Lulusan Sistem Informasi UISI"
        />
      </div>

      {/* Career Items */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Daftar Prospek Karir</h3>
        
        {formData.data.careers.map((career, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium mb-3">Karir {index + 1}</h4>
            
            <div className="space-y-3">
              <input
                type="text"
                value={career.id}
                onChange={(e) => updateCareerItem(index, "id", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="ID (erp, auditor, consultant, analyst)"
                disabled
              />
              
              <input
                type="text"
                value={career.title}
                onChange={(e) => updateCareerItem(index, "title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nama karir"
              />
              
              <textarea
                value={career.description}
                onChange={(e) => updateCareerItem(index, "description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Deskripsi karir"
              />
              
              <input
                type="text"
                value={career.image}
                onChange={(e) => updateCareerItem(index, "image", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="img/bidangerp.png"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Testimoni Editor
function TestimoniEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    data: Array.isArray(data?.data) ? data.data : [],
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        data: Array.isArray(data.data) ? data.data : [],
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateTestimoniItem = (index, field, value) => {
    const newData = [...formData.data];
    newData[index] = { ...newData[index], [field]: value };
    setFormData({ ...formData, data: newData });
  };

  const addTestimoni = () => {
    setFormData({
      ...formData,
      data: [
        ...formData.data,
        {
          name: "",
          work: "",
          image: "",
          companyLogo: "",
          description: "",
        },
      ],
    });
  };

  const removeTestimoni = (index) => {
    const newData = formData.data.filter((_, i) => i !== index);
    setFormData({ ...formData, data: newData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Apa Kata Alumni?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="testimoni alumni"
        />
      </div>

      {/* Testimoni Items */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Daftar Testimoni</h3>
          <button
            type="button"
            onClick={addTestimoni}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tambah Testimoni
          </button>
        </div>
        
        {formData.data.map((testimoni, index) => (
          <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Testimoni {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeTestimoni(index)}
                className="text-red-600 hover:text-red-800"
              >
                Hapus
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={testimoni.name}
                onChange={(e) => updateTestimoniItem(index, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Nama alumni"
              />
              
              <input
                type="text"
                value={testimoni.work}
                onChange={(e) => updateTestimoniItem(index, "work", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Pekerjaan"
              />
              
              <input
                type="text"
                value={testimoni.image}
                onChange={(e) => updateTestimoniItem(index, "image", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="img/alumniname.png"
              />
              
              <input
                type="text"
                value={testimoni.companyLogo}
                onChange={(e) => updateTestimoniItem(index, "companyLogo", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="img/companylogo.png"
              />
              
              <textarea
                value={testimoni.description}
                onChange={(e) => updateTestimoniItem(index, "description", e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Testimoni alumni"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Jumbotron Promo Editor
function JumbotronPromoEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
    data: data?.data && typeof data.data === 'object' ? data.data : { buttonText: "", buttonUrl: "" },
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
        data: data.data && typeof data.data === 'object' ? data.data : { buttonText: "", buttonUrl: "" },
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subtitle (Badge)
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="sisfor uisi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Mari Bergabung Bersama Kami"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Bergabung bersama kami..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Gambar Background
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="img/gabung.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teks Tombol
        </label>
        <input
          type="text"
          value={formData.data.buttonText}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, buttonText: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Mari Bergabung"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Tombol
        </label>
        <input
          type="text"
          value={formData.data.buttonUrl}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, buttonUrl: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="https://s.id/DaftarSisforUISI"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Social Media Editor
function SocialMediaEditor({ data, onSave, saving }) {
  const defaultData = {
    username: "",
    instagramUrl: "",
    uisiInstagram: "",
    buttonText: "",
  };

  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
    data: data?.data && typeof data.data === 'object' ? data.data : defaultData,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
        data: data.data && typeof data.data === 'object' ? data.data : defaultData,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username (@sisforuisi)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="@sisforuisi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) =>
            setFormData({ ...formData, subtitle: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Official Account Departemen & HIMASISFOR"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Afiliasi
        </label>
        <input
          type="text"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Universitas Internasional Semen Indonesia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Logo
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) =>
            setFormData({ ...formData, image: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="img/logo2.png"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Instagram
        </label>
        <input
          type="text"
          value={formData.data.instagramUrl}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, instagramUrl: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="https://www.instagram.com/sisforuisi/"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instagram UISI
        </label>
        <input
          type="text"
          value={formData.data.uisiInstagram}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, uisiInstagram: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="@sayauisi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teks Tombol
        </label>
        <input
          type="text"
          value={formData.data.buttonText}
          onChange={(e) =>
            setFormData({
              ...formData,
              data: { ...formData.data, buttonText: e.target.value },
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Follow On Instagram"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
