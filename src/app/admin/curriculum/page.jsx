"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CurriculumManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const [title, setTitle] = useState("Kurikulum Program Studi");
  const [subtitle, setSubtitle] = useState("Sistem Informasi Bisnis");
  const [kurikulum, setKurikulum] = useState([]);
  
  const [editMode, setEditMode] = useState({});
  const [addMode, setAddMode] = useState({});

  // Fetch curriculum data
  useEffect(() => {
    async function fetchCurriculum() {
      try {
        const response = await fetch("/api/curriculum");
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title || "Kurikulum Program Studi");
          setSubtitle(data.subtitle || "Sistem Informasi Bisnis");
          setKurikulum(data.data || []);
        } else {
          setMessage({ type: "error", text: "Gagal memuat kurikulum" });
        }
      } catch (error) {
        console.error("Error fetching curriculum:", error);
        setMessage({ type: "error", text: "Error memuat kurikulum" });
      } finally {
        setLoading(false);
      }
    }
    fetchCurriculum();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("/api/curriculum", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          subtitle,
          data: kurikulum,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Kurikulum berhasil disimpan!" });
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      } else {
        setMessage({ type: "error", text: "Gagal menyimpan kurikulum" });
      }
    } catch (error) {
      console.error("Error saving curriculum:", error);
      setMessage({ type: "error", text: "Error menyimpan kurikulum" });
    } finally {
      setSaving(false);
    }
  };

  const addSemester = () => {
    const newSemester = {
      semester: kurikulum.length + 1,
      matkul: [],
    };
    setKurikulum([...kurikulum, newSemester]);
  };

  const deleteSemester = (semesterIndex) => {
    if (confirm(`Hapus Semester ${semesterIndex + 1}?`)) {
      const updated = kurikulum.filter((_, index) => index !== semesterIndex);
      // Renumber semesters
      const renumbered = updated.map((sem, idx) => ({
        ...sem,
        semester: idx + 1,
      }));
      setKurikulum(renumbered);
    }
  };

  const addCourse = (semesterIndex) => {
    setAddMode({ [semesterIndex]: true });
  };

  const saveCourse = (semesterIndex, course) => {
    const updated = [...kurikulum];
    if (!updated[semesterIndex].matkul) {
      updated[semesterIndex].matkul = [];
    }
    updated[semesterIndex].matkul.push(course);
    setKurikulum(updated);
    setAddMode({ [semesterIndex]: false });
  };

  const cancelAddCourse = (semesterIndex) => {
    setAddMode({ [semesterIndex]: false });
  };

  const editCourse = (semesterIndex, courseIndex) => {
    setEditMode({ [`${semesterIndex}-${courseIndex}`]: true });
  };

  const updateCourse = (semesterIndex, courseIndex, updatedCourse) => {
    const updated = [...kurikulum];
    updated[semesterIndex].matkul[courseIndex] = updatedCourse;
    setKurikulum(updated);
    setEditMode({ [`${semesterIndex}-${courseIndex}`]: false });
  };

  const cancelEditCourse = (semesterIndex, courseIndex) => {
    setEditMode({ [`${semesterIndex}-${courseIndex}`]: false });
  };

  const deleteCourse = (semesterIndex, courseIndex) => {
    if (confirm("Hapus mata kuliah ini?")) {
      const updated = [...kurikulum];
      updated[semesterIndex].matkul.splice(courseIndex, 1);
      setKurikulum(updated);
    }
  };

  const calculateTotalSKS = (matkul) => {
    return matkul.reduce((total, mk) => total + (mk.sks || 0), 0);
  };

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
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Kelola Kurikulum
          </h1>
          <p className="mt-2 text-sm lg:text-base text-gray-600">
            Kelola mata kuliah per semester untuk halaman kurikulum
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-4 lg:mb-6 p-3 lg:p-4 rounded-md text-sm lg:text-base ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Main Info Form */}
        <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-4 lg:mb-6">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Informasi Umum</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
              />
            </div>
          </div>
        </div>

        {/* Semester Cards */}
        <div className="space-y-4 lg:space-y-6">
          {kurikulum.map((semester, semesterIndex) => (
            <div
              key={semesterIndex}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="bg-blue-600 text-white px-4 lg:px-6 py-3 lg:py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-lg lg:text-xl font-semibold">
                    Semester {semester.semester}
                  </h3>
                  <p className="text-xs lg:text-sm text-blue-100">
                    Total SKS: {calculateTotalSKS(semester.matkul || [])}
                  </p>
                </div>
                <button
                  onClick={() => deleteSemester(semesterIndex)}
                  className="px-3 lg:px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md transition-colors text-sm lg:text-base whitespace-nowrap"
                >
                  Hapus Semester
                </button>
              </div>

              <div className="p-4 lg:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-max">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">
                          No
                        </th>
                        <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 min-w-[150px]">
                          Nama Mata Kuliah
                        </th>
                        <th className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs lg:text-sm font-semibold text-gray-900">
                          SKS
                        </th>
                        <th className="px-2 lg:px-4 py-2 lg:py-3 text-right text-xs lg:text-sm font-semibold text-gray-900 min-w-[100px]">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {semester.matkul &&
                        semester.matkul.map((mk, courseIndex) => (
                          <CourseRow
                            key={courseIndex}
                            course={mk}
                            courseIndex={courseIndex}
                            semesterIndex={semesterIndex}
                            isEditMode={
                              editMode[`${semesterIndex}-${courseIndex}`]
                            }
                            onEdit={() => editCourse(semesterIndex, courseIndex)}
                            onUpdate={(updated) =>
                              updateCourse(semesterIndex, courseIndex, updated)
                            }
                            onCancelEdit={() =>
                              cancelEditCourse(semesterIndex, courseIndex)
                            }
                            onDelete={() =>
                              deleteCourse(semesterIndex, courseIndex)
                            }
                          />
                        ))}

                      {addMode[semesterIndex] && (
                        <AddCourseRow
                          onSave={(course) => saveCourse(semesterIndex, course)}
                          onCancel={() => cancelAddCourse(semesterIndex)}
                        />
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => addCourse(semesterIndex)}
                    disabled={addMode[semesterIndex]}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors disabled:bg-gray-300"
                  >
                    + Tambah Mata Kuliah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Semester Button */}
        <div className="mt-6">
          <button
            onClick={addSemester}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            + Tambah Semester Baru
          </button>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => router.push("/admin/dashboard")}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-300"
          >
            {saving ? "Menyimpan..." : "Simpan Kurikulum"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Course Row Component
function CourseRow({
  course,
  courseIndex,
  semesterIndex,
  isEditMode,
  onEdit,
  onUpdate,
  onCancelEdit,
  onDelete,
}) {
  const [editedCourse, setEditedCourse] = useState(course);

  useEffect(() => {
    setEditedCourse(course);
  }, [course]);

  if (isEditMode) {
    return (
      <tr className="border-b bg-yellow-50">
        <td className="px-4 py-3">{courseIndex + 1}</td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editedCourse.nama}
            onChange={(e) =>
              setEditedCourse({ ...editedCourse, nama: e.target.value })
            }
            className="w-full px-2 py-1 border rounded"
            placeholder="Nama Mata Kuliah"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            value={editedCourse.sks || ""}
            onChange={(e) =>
              setEditedCourse({
                ...editedCourse,
                sks: parseInt(e.target.value) || null,
              })
            }
            className="w-20 px-2 py-1 border rounded"
            placeholder="SKS"
          />
        </td>
        <td className="px-4 py-3 text-right space-x-2">
          <button
            onClick={() => onUpdate(editedCourse)}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
          >
            Simpan
          </button>
          <button
            onClick={onCancelEdit}
            className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
          >
            Batal
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{courseIndex + 1}</td>
      <td className="px-4 py-3 text-sm">{course.nama}</td>
      <td className="px-4 py-3 text-sm">{course.sks || "-"}</td>
      <td className="px-4 py-3 text-right space-x-2">
        <button
          onClick={onEdit}
          className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded"
        >
          Hapus
        </button>
      </td>
    </tr>
  );
}

// Add Course Row Component
function AddCourseRow({ onSave, onCancel }) {
  const [newCourse, setNewCourse] = useState({ nama: "", sks: null });

  const handleSave = () => {
    if (newCourse.nama.trim()) {
      onSave(newCourse);
      setNewCourse({ nama: "", sks: null });
    }
  };

  return (
    <tr className="border-b bg-green-50">
      <td className="px-4 py-3">-</td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={newCourse.nama}
          onChange={(e) => setNewCourse({ ...newCourse, nama: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          placeholder="Nama Mata Kuliah"
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          value={newCourse.sks || ""}
          onChange={(e) =>
            setNewCourse({
              ...newCourse,
              sks: parseInt(e.target.value) || null,
            })
          }
          className="w-20 px-2 py-1 border rounded"
          placeholder="SKS"
        />
      </td>
      <td className="px-4 py-3 text-right space-x-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded"
        >
          Simpan
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded"
        >
          Batal
        </button>
      </td>
    </tr>
  );
}
