"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileContentManagement() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("hero-profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [contents, setContents] = useState({});

  // Fetch all profile content sections
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
    { id: "hero-profile", label: "Hero Section" },
    { id: "video-profile", label: "Video Profile" },
    { id: "visi", label: "Visi" },
    { id: "misi", label: "Misi" },
    { id: "profil-dosen", label: "Profil Dosen" },
    { id: "akreditasi", label: "Akreditasi" },
    { id: "profil-alumni", label: "Profil Alumni" },
    { id: "infinite-alumni", label: "Daftar Alumni" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Content Management - Halaman Profil
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Kelola konten halaman profil website
          </p>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-lg text-sm lg:text-base ${
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
            <nav className="flex space-x-2 lg:space-x-4 px-3 lg:px-6 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 lg:py-4 px-3 lg:px-6 text-xs lg:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
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
          <div className="p-4 lg:p-6">
            {activeTab === "hero-profile" && (
              <HeroProfileEditor
                data={contents["hero-profile"]}
                onSave={(data) => handleSave("hero-profile", data)}
                saving={saving}
              />
            )}
            {activeTab === "video-profile" && (
              <VideoProfileEditor
                data={contents["video-profile"]}
                onSave={(data) => handleSave("video-profile", data)}
                saving={saving}
              />
            )}
            {activeTab === "visi" && (
              <VisiEditor
                data={contents.visi}
                onSave={(data) => handleSave("visi", data)}
                saving={saving}
              />
            )}
            {activeTab === "misi" && (
              <MisiEditor
                data={contents.misi}
                onSave={(data) => handleSave("misi", data)}
                saving={saving}
              />
            )}
            {activeTab === "profil-dosen" && (
              <ProfilDosenEditor
                data={contents["profil-dosen"]}
                onSave={(data) => handleSave("profil-dosen", data)}
                saving={saving}
              />
            )}
            {activeTab === "akreditasi" && (
              <AkreditasiEditor
                data={contents.akreditasi}
                onSave={(data) => handleSave("akreditasi", data)}
                saving={saving}
              />
            )}
            {activeTab === "profil-alumni" && (
              <ProfilAlumniEditor
                data={contents["profil-alumni"]}
                onSave={(data) => handleSave("profil-alumni", data)}
                saving={saving}
              />
            )}
            {activeTab === "infinite-alumni" && (
              <InfiniteAlumniEditor
                data={contents["infinite-alumni"]}
                onSave={(data) => handleSave("infinite-alumni", data)}
                saving={saving}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hero Profile Section Editor
function HeroProfileEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
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
          Judul Utama
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Sistem Informasi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Universitas Internasional Semen Indonesia"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Program studi S1 Sistem Informasi..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Background Image URL
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="/img/heroprofile.png"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Video Profile Editor
function VideoProfileEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    content: data?.content || "",
    image: data?.image || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        content: data.content || "",
        image: data.image || "",
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
          Video URL (YouTube)
        </label>
        <input
          type="text"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="https://www.youtube.com/watch?v=WQ4avou98wc"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Thumbnail Image URL
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="/img/video.png"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Visi Editor
function VisiEditor({ data, onSave, saving }) {
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
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Visi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Program Studi Sistem Informasi UISI"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Isi Visi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Menjadi Departemen Sistem Informasi yang unggul..."
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Misi Editor
function MisiEditor({ data, onSave, saving }) {
  const defaultData = {
    items: ["", "", "", "", ""]
  };

  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    data: data?.data && typeof data.data === 'object' ? data.data : defaultData,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        data: data.data && typeof data.data === 'object' ? data.data : defaultData,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateItem = (index, value) => {
    const newItems = [...formData.data.items];
    newItems[index] = value;
    setFormData({
      ...formData,
      data: { ...formData.data, items: newItems }
    });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      data: { ...formData.data, items: [...formData.data.items, ""] }
    });
  };

  const removeItem = (index) => {
    const newItems = formData.data.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      data: { ...formData.data, items: newItems }
    });
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
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Misi"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Program Studi Sistem Informasi UISI"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Daftar Misi
        </label>
        {formData.data.items.map((item, index) => (
          <div key={index} className="flex gap-2 mb-3">
            <div className="flex-shrink-0 w-8 h-10 flex items-center justify-center bg-gray-100 rounded">
              {index + 1}
            </div>
            <textarea
              value={item}
              onChange={(e) => updateItem(index, e.target.value)}
              rows={2}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder={`Misi ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => removeItem(index)}
              className="flex-shrink-0 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              Hapus
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Misi
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Profil Dosen Editor
function ProfilDosenEditor({ data, onSave, saving }) {
  const defaultData = {
    heading: "Profil Dosen",
    subheading: "Sistem Informasi UISI",
    dosens: []
  };

  const [formData, setFormData] = useState({
    data: data?.data && typeof data.data === 'object' ? data.data : defaultData,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        data: data.data && typeof data.data === 'object' ? data.data : defaultData,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateDosen = (index, field, value) => {
    const newDosens = [...formData.data.dosens];
    newDosens[index] = { ...newDosens[index], [field]: value };
    setFormData({
      ...formData,
      data: { ...formData.data, dosens: newDosens }
    });
  };

  const addDosen = () => {
    setFormData({
      ...formData,
      data: {
        ...formData.data,
        dosens: [...formData.data.dosens, {
          name: "",
          expertise: "",
          image: ""
        }]
      }
    });
  };

  const removeDosen = (index) => {
    const newDosens = formData.data.dosens.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      data: { ...formData.data, dosens: newDosens }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Judul Section
        </label>
        <input
          type="text"
          value={formData.data.heading}
          onChange={(e) => setFormData({
            ...formData,
            data: { ...formData.data, heading: e.target.value }
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Profil Dosen"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.data.subheading}
          onChange={(e) => setFormData({
            ...formData,
            data: { ...formData.data, subheading: e.target.value }
          })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Sistem Informasi UISI"
        />
      </div>

      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Daftar Dosen
        </label>
        {formData.data.dosens.map((dosen, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Dosen {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeDosen(index)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              >
                Hapus
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={dosen.name}
                onChange={(e) => updateDosen(index, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nama Dosen"
              />
              <textarea
                value={dosen.expertise}
                onChange={(e) => updateDosen(index, 'expertise', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Bidang Keahlian"
              />
              <input
                type="text"
                value={dosen.image}
                onChange={(e) => updateDosen(index, 'image', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="URL Foto (contoh: /img/profil/nama.jpg)"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addDosen}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Dosen
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Akreditasi Editor
function AkreditasiEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
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
          Judul (gunakan &lt;span className='text-red-600'&gt; untuk teks merah)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Sertifikat <span className='text-red-600'>Akreditasi</span>"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Program Studi Sistem Informasi UISI"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Per tanggal 3 April 2023..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          URL Gambar Sertifikat
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="/img/sertif_akreditasi.png"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Profil Alumni Editor
function ProfilAlumniEditor({ data, onSave, saving }) {
  const [formData, setFormData] = useState({
    title: data?.title || "",
    subtitle: data?.subtitle || "",
    content: data?.content || "",
    image: data?.image || "",
  });

  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        subtitle: data.subtitle || "",
        content: data.content || "",
        image: data.image || "",
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
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Profil Lulusan"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sub Judul
        </label>
        <input
          type="text"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Sistem Informasi UISI"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Deskripsi
        </label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="Lulusan Program Studi Sistem Informasi UISI..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URL (YouTube)
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          placeholder="https://www.youtube.com/watch?v=Pz30NmEzSew"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}

// Infinite Alumni Editor
function InfiniteAlumniEditor({ data, onSave, saving }) {
  const defaultData = {
    alumni: [
      {
        name: "Rizqi A. W. Y., S.Kom",
        img: "img/alumni/rizqi.png",
        job: "Surveyor SPBE PT. Tatacipta Teknologi Indonesia",
      },
      {
        name: "Edwin R. Putra, S.Kom",
        img: "img/alumni/edwin.png",
        job: "Management Information System PT. Wilmar Nabati Indonesia",
      },
      {
        name: "Felix Atmaja, S.Kom",
        img: "img/alumni/felix.png",
        job: "Officer Program Retailership Semen Indonesia Group",
      },
      {
        name: "Juliana Kristi, S.Kom",
        img: "img/alumni/juliana.png",
        job: "IT Planning & Control di PT. Petrokimia Gresik",
      },
    ]
  };

  const [formData, setFormData] = useState({
    data: data?.data && typeof data.data === 'object' ? data.data : defaultData,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        data: data.data && typeof data.data === 'object' ? data.data : defaultData,
      });
    }
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const updateAlumni = (index, field, value) => {
    const newAlumni = [...formData.data.alumni];
    newAlumni[index] = { ...newAlumni[index], [field]: value };
    setFormData({
      ...formData,
      data: { ...formData.data, alumni: newAlumni }
    });
  };

  const addAlumni = () => {
    setFormData({
      ...formData,
      data: {
        ...formData.data,
        alumni: [...formData.data.alumni, {
          name: "",
          img: "",
          job: ""
        }]
      }
    });
  };

  const removeAlumni = (index) => {
    const newAlumni = formData.data.alumni.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      data: { ...formData.data, alumni: newAlumni }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Daftar Alumni (yang akan ditampilkan dalam animasi bergerak)
        </label>
        {formData.data.alumni.map((alumni, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium">Alumni {index + 1}</h4>
              <button
                type="button"
                onClick={() => removeAlumni(index)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm"
              >
                Hapus
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={alumni.name}
                onChange={(e) => updateAlumni(index, 'name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Nama Alumni"
              />
              <input
                type="text"
                value={alumni.job}
                onChange={(e) => updateAlumni(index, 'job', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Jabatan/Pekerjaan"
              />
              <input
                type="text"
                value={alumni.img}
                onChange={(e) => updateAlumni(index, 'img', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="URL Foto (contoh: img/alumni/nama.png)"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addAlumni}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tambah Alumni
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400"
      >
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
