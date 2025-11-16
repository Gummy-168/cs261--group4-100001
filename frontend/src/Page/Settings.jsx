import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaUser, FaBell, FaPalette, FaPhone } from "react-icons/fa";
import { isAdmin } from "../lib/authz";
import { applyThemePreference } from "../lib/theme";

const MENU = [
  { id: "profile", label: "แก้ไขโปรไฟล์", icon: <FaUser /> },
  { id: "notifications", label: "การแจ้งเตือน", icon: <FaBell /> },
  { id: "theme", label: "ธีมหน้าจอ", icon: <FaPalette /> },
  { id: "contact", label: "ติดต่อเรา", icon: <FaPhone /> },
];

export default function SettingsPage({ navigate, auth }) {
  const [active, setActive] = useState("profile");
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)]">
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => navigate("/")}
        onActivities={() => navigate("/activities")}
      />
      <div className="flex flex-1 pt-[68px]">
        <aside className="w-[260px] border-r border-gray-200/70 bg-[var(--color-bg)] px-6 py-8 hidden md:block">
      <div className="text-center">
          <h2 className="text-xl font-semibold">การตั้งค่า</h2>
          <div className="h-[2px] w-48 bg-gray-300 mt-2 mb-6 mx-auto" />
      </div>

          <nav className="flex flex-col gap-2">
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  active === item.id
                    ? "bg-[var(--color-brand)] text-black"
                    : "text-gray-600 hover:bg-black/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 md:px-10 lg:px-16 py-10">
          <div className="mx-auto max-w-[980px]">
            {active === "profile" && <ProfileSection auth={auth} />}
            {active === "notifications" && <NotificationsSection auth={auth} />}
            {active === "theme" && <ThemeSection auth={auth} />}
            {active === "contact" && <ContactSection />}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function ProfileSection({ auth }) {
  const saved = auth.profile ?? {};
  const [edit, setEdit] = useState(false);
  const adminLocked = isAdmin(auth);
  const [draft, setDraft] = useState({
    displaynameTh: saved.displaynameTh ?? "",
    username: saved.username ?? "",
    email: saved.email ?? "",
  });
  const [avatarSaved, setAvatarSaved] = useState(saved.avatarUrl || "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    setDraft({
      displaynameTh: saved.displaynameTh ?? "",
      username: saved.username ?? "",
      email: saved.email ?? "",
    });
    setAvatarSaved(saved.avatarUrl || "");
  }, [saved.displaynameTh, saved.username, saved.email, saved.avatarUrl]);
  useEffect(() => {
    if (adminLocked) {
      setEdit(false);
      setAvatarPreview("");
    }
  }, [adminLocked]);

  const shownAvatar = useMemo(() => {
    if (edit && avatarPreview) return avatarPreview;
    if (avatarSaved) return avatarSaved;
    return "";
  }, [edit, avatarPreview, avatarSaved]);

  const pickFile = () => fileRef.current?.click();

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(String(reader.result || ""));
    reader.readAsDataURL(f);
  };

  const cancel = () => {
    setEdit(false);
    setAvatarPreview("");
    setDraft({
      displaynameTh: saved.displaynameTh ?? "",
      username: saved.username ?? "",
      email: saved.email ?? "",
    });
  };

  const save = () => {
    const next = {
      ...(auth.profile ?? {}),
      displaynameTh: draft.displaynameTh,
      username: draft.username,
      email: draft.email,
      avatarUrl: avatarPreview ? avatarPreview : avatarSaved,
    };
    auth.updateProfile(next);
    setAvatarSaved(next.avatarUrl || "");
    setAvatarPreview("");
    setEdit(false);
  };

  return (
    <section>
      <h1 className="text-xl font-semibold mb-6">บัญชีของคุณ</h1>

      {adminLocked && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          บัญชีผู้ดูแลระบบถูกล็อก ไม่อนุญาตให้แก้ไขข้อมูลจากหน้านี้
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {shownAvatar ? (
                <img src={shownAvatar} className="w-full h-full object-cover" />
              ) : (
                <div className="text-4xl">👤</div>
              )}
            </div>
            {edit && (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
                <button
                  onClick={pickFile}
                  className="px-4 py-1.5 rounded-full text-sm bg-white border border-gray-300 hover:bg-gray-100"
                >
                  เปลี่ยนภาพ
                </button>
              </>
            )}
          </div>
        </div>

        <div className="col-span-12 md:col-span-7 flex md:justify-end">
          {!adminLocked && !edit && (
            <button
              onClick={() => setEdit(true)}
              className="px-8 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
            >
              แก้ไขข้อมูล
            </button>
          )}
          {adminLocked && (
            <span className="text-sm text-gray-500">
              ผู้ดูแลระบบไม่สามารถแก้ไขจากหน้านี้
            </span>
          )}
        </div>

        <div className="col-span-12 md:col-span-5">
          <Field
            label="ชื่อที่แสดงให้เห็น"
            value={draft.displaynameTh}
            onChange={(v) => setDraft((s) => ({ ...s, displaynameTh: v }))}
            readOnly={!edit}
            placeholder="Johnny"
          />
          <div className="mt-4">
            <Field
              label="ชื่อ"
              value={"xxxx xxxxxxxx"}
              readOnly
              placeholder="xxxx xxxxxxxx"
            />
          </div>
        </div>

        <div className="col-span-12 md:col-span-7">
          <Field
            label="รหัสนักศึกษา"
            value={draft.username}
            onChange={(v) => setDraft((s) => ({ ...s, username: v }))}
            readOnly
            placeholder=""
          />
          <div className="mt-4">
            <Field
              label="อีเมล"
              value={draft.email}
              onChange={(v) => setDraft((s) => ({ ...s, email: v }))}
              readOnly
              placeholder=""
            />
          </div>
        </div>

        {edit && (
          <div className="col-span-12 flex justify-end gap-3 pt-2">
            <button
              onClick={cancel}
              className="px-8 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-100"
            >
              ยกเลิก
            </button>
            <button
              onClick={save}
              className="px-8 py-2 rounded-full bg-[#ef4444] text-white hover:bg-[#dc2626]"
            >
              บันทึกข้อมูล
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, readOnly, placeholder }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <input
        type="text"
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-md border px-4 py-3 outline-none ${
          readOnly
            ? "bg-[var(--color-bg)] border-gray-300"
            : "bg-white border-gray-300 focus:ring-2 focus:ring-gray-200"
        }`}
      />
    </div>
  );
}

function NotificationsSection({ auth }) {
  const defaults = {
    follow: false,
    near: false,
    recommend: false,
    announce: false,
    uploadReminder: false,
  };
  const pref = { ...defaults, ...(auth.preferences?.notifications ?? {}) };
  const [toggles, setToggles] = useState(pref);
  useEffect(() => {
    setToggles({ ...defaults, ...(auth.preferences?.notifications ?? {}) });
  }, [auth.preferences?.notifications]);

  const toggle = (key) => {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    auth.updatePreferences((p) => ({ ...p, notifications: next }));
  };

  const options = isAdmin(auth)
    ? [
        ["uploadReminder", "แจ้งหลังจบกิจกรรมเพื่ออัปโหลดรายชื่อผู้เข้าร่วม"],
        ["announce", "ประกาศจาก MeetMeet"],
      ]
    : [
        ["follow", "เมื่อมีการแก้ไขกิจกรรมที่ติดตามอยู่"],
        ["near", "เมื่อกิจกรรมที่ติดตามใกล้มาถึง"],
        ["recommend", "กิจกรรมแนะนำ"],
        ["announce", "ประกาศจาก MeetMeet"],
      ];

  return (
    <section>
      <h1 className="text-xl font-semibold mb-6">การแจ้งเตือน</h1>
      <div className="max-w-[560px] space-y-5">
        {options.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm">{label}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(toggles[key])}
                onChange={() => toggle(key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#ef4444] transition-all" />
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition-transform" />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemeSection({ auth }) {
  const current = auth.preferences?.theme ?? "light";
  const [theme, setTheme] = useState(current);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTheme(current);
  }, [current]);

  const saveTheme = () => {
    if (theme === current) return;
    setSaving(true);
    auth.updatePreferences((p) => ({ ...p, theme }));
    applyThemePreference(theme);
    setSaving(false);
  };

  const options = [
    { id: "system", label: "ค่าเริ่มต้นระบบ", color: "var(--color-bg)" },
    { id: "light", label: "สว่าง", color: "#ffffff" },
    { id: "dark", label: "มืด", color: "#3b3b3b" },
  ];

  return (
    <section>
      <h1 className="text-xl font-semibold mb-6">ธีมหน้าจอ</h1>

      <div className="rounded-2xl p-9 bg-[color-mix(in_oklab,var(--color-fg)_6%,transparent)] ring-1 ring-white/10 max-w-[720px]">
        <div className="text-sm mb-2">ธีมระบบ</div>
        <div className="text-xs text-gray-500 mb-6">ตั้งค่าธีมเพื่อการมองเห็นที่ดีขึ้น</div>

        <div className="flex gap-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`relative w-[74px] h-[74px] rounded-md border-2 transition ${
                theme === opt.id ? "border-red-500" : "border-gray-300 hover:border-gray-400"
              }`}
              style={{ backgroundColor: opt.color }}
            >
              {theme === opt.id && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center bg-red-500 text-white text-xs rounded-full w-5 h-5">
                  ✓
                </span>
              )}
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10 flex gap-3">
          <button
            onClick={saveTheme}
            disabled={theme === current || saving}
            className="px-6 py-2 rounded-full bg-red-500 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "กำลังบันทึก..." : "บันทึกธีม"}
          </button>
          <button
            onClick={() => setTheme(current)}
            disabled={theme === current || saving}
            className="px-6 py-2 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="max-w-[720px]">
      <h1 className="text-xl font-semibold mb-6">ติดต่อเรา</h1>
      <div className="space-y-4 text-sm">
        <div>
          ติดต่อเราได้ทุกเวลา
          <br />
          เราพร้อมช่วยเหลือในเรื่องข้อสงสัยและปัญหาของคุณ
        </div>
        <div>📞 09x-xxx-xxxx</div>
        <div>✉️ somchai@dome.tu.ac.th</div>
        <div>📍 3982 Maplewood Drive, Apt 4B, Portland, OR 97206, USA</div>
      </div>
    </section>
  );
}
