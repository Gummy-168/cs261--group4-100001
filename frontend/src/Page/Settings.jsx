import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { THEME } from "../theme";
import { FaUser, FaBell, FaPalette, FaLock, FaPhone } from "react-icons/fa";

const MENU = [
  { id: "profile", label: "แก้ไขโปรไฟล์", icon: <FaUser /> },
  { id: "notifications", label: "การแจ้งเตือน", icon: <FaBell /> },
  { id: "theme", label: "ธีมหน้าจอ", icon: <FaPalette /> },
  { id: "privacy", label: "ความเป็นส่วนตัว", icon: <FaLock /> },
  { id: "contact", label: "ติดต่อเรา", icon: <FaPhone /> },
];

const DEFAULT_PROFILE = {
  fullName: "",
  nickname: "",
  faculty: "",
  phone: "",
  email: "",
  bio: "",
};

const DEFAULT_NOTIFICATIONS = {
  follow: true,
  near: true,
  soon: true,
  recommend: true,
  announce: true,
};

const DEFAULT_PRIVACY = {
  showFavorites: true,
};

const THEME_OPTIONS = [
  {
    id: "system",
    label: "ตามระบบ",
    description: "ปรับธีมตามโหมดที่ตั้งในอุปกรณ์ของคุณโดยอัตโนมัติ",
    color: "#f9f9f9",
  },
  {
    id: "light",
    label: "โหมดสว่าง",
    description: "พื้นหลังสีอ่อน เหมาะกับการใช้งานในที่สว่าง",
    color: "#ffffff",
  },
  {
    id: "dark",
    label: "โหมดมืด",
    description: "พื้นหลังสีเข้ม ลดแสงรบกวนเวลากลางคืน",
    color: "#1f2933",
  },
];

const CONTACT_ITEMS = [
  { icon: "📞", label: "โทรศัพท์", value: "090-xxxxxxx" },
  { icon: "✉️", label: "อีเมล", value: "support@meetmeet.app" },
  { icon: "🏫", label: "ที่อยู่", value: "อาคารเรียนรวม ม.ธรรมศาสตร์ ศูนย์รังสิต" },
];

const toProfileDraft = (profile) => ({
  ...DEFAULT_PROFILE,
  ...(profile ?? {}),
  fullName: profile?.fullName ?? profile?.name ?? "",
});

const profileInitials = (profile) => {
  const source =
    profile.fullName?.trim() ||
    profile.nickname?.trim() ||
    profile.email?.trim() ||
    "MM";
  const parts = source.split(" ").filter(Boolean);
  if (parts.length === 0) return source.slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const isProfileDirty = (draft, original) => {
  return Object.keys(DEFAULT_PROFILE).some(
    (key) => (draft[key] ?? "") !== (original[key] ?? "")
  );
};

export default function SettingsPage({ navigate, auth }) {
  const [active, setActive] = useState("profile");

  const originalProfile = useMemo(() => toProfileDraft(auth?.profile), [auth?.profile]);
  const [profileDraft, setProfileDraft] = useState(originalProfile);
  const [profileStatus, setProfileStatus] = useState(null);

  useEffect(() => {
    setProfileDraft(originalProfile);
  }, [originalProfile]);

  const originalNotifications = useMemo(
    () => ({
      ...DEFAULT_NOTIFICATIONS,
      ...(auth?.preferences?.notifications ?? {}),
    }),
    [auth?.preferences?.notifications]
  );
  const [notifications, setNotifications] = useState(originalNotifications);
  useEffect(() => {
    setNotifications(originalNotifications);
  }, [originalNotifications]);

  const originalPrivacy = useMemo(
    () => ({
      ...DEFAULT_PRIVACY,
      ...(auth?.preferences?.privacy ?? {}),
    }),
    [auth?.preferences?.privacy]
  );
  const [privacy, setPrivacy] = useState(originalPrivacy);
  useEffect(() => {
    setPrivacy(originalPrivacy);
  }, [originalPrivacy]);

  const [themeChoice, setThemeChoice] = useState(
    auth?.preferences?.theme ?? "system"
  );
  useEffect(() => {
    setThemeChoice(auth?.preferences?.theme ?? "system");
  }, [auth?.preferences?.theme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.themePreference = themeChoice;
    }
  }, [themeChoice]);

  const handleProfileChange = (field, value) => {
    setProfileDraft((prev) => ({ ...prev, [field]: value }));
  };

  const resetProfile = () => {
    setProfileDraft(originalProfile);
    setProfileStatus(null);
  };

  const saveProfile = () => {
    auth?.updateProfile?.(profileDraft);
    setProfileStatus("บันทึกแล้ว");
    setTimeout(() => setProfileStatus(null), 2500);
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      auth?.updatePreferences?.((current) => ({
        ...current,
        notifications: { ...current.notifications, [key]: next[key] },
      }));
      return next;
    });
  };

  const togglePrivacy = (key) => {
    setPrivacy((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      auth?.updatePreferences?.((current) => ({
        ...current,
        privacy: { ...current.privacy, [key]: next[key] },
      }));
      return next;
    });
  };

  const selectTheme = (theme) => {
    setThemeChoice(theme);
    auth?.updatePreferences?.((current) => ({ ...current, theme }));
  };

  const profileDirty = useMemo(
    () => isProfileDirty(profileDraft, originalProfile),
    [profileDraft, originalProfile]
  );

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: THEME.page, color: THEME.text }}
    >
      <Header
        auth={auth}
        navigate={navigate}
        onCalendarJump={() => navigate("/")}
        onActivities={() => navigate("/activities")}
      />
      <div className="flex flex-1 pt-[68px]">
        <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-black/10 md:bg-white md:p-6">
          <div className="flex flex-col items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">การตั้งค่า</h2>
            <div className="w-28 h-[2px] bg-black mt-2"></div>
          </div>
          <nav className="flex flex-col gap-2 border-t border-black/10 pt-4">
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active === item.id
                    ? "bg-[#f6c556]/60 text-black"
                    : "text-gray-600 hover:bg-black/5"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="md:hidden px-4 py-4 bg-white/90 backdrop-blur-sm border-b border-black/5 sticky top-[68px] z-30">
          <label className="text-xs font-medium text-gray-500 block mb-2">
            เลือกหัวข้อ
          </label>
          <select
            value={active}
            onChange={(event) => setActive(event.target.value)}
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f6c556]"
          >
            {MENU.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <main className="flex-1 px-4 pb-12 pt-6 md:p-10 bg-gray-50 space-y-8">
          {active === "profile" && (
            <ProfileSection
              draft={profileDraft}
              onChange={handleProfileChange}
              onSave={saveProfile}
              onReset={resetProfile}
              canSubmit={profileDirty}
              status={profileStatus}
            />
          )}
          {active === "notifications" && (
            <NotificationsSection values={notifications} onToggle={toggleNotification} />
          )}
          {active === "theme" && (
            <ThemeSection selected={themeChoice} onSelect={selectTheme} />
          )}
          {active === "privacy" && (
            <PrivacySection values={privacy} onToggle={togglePrivacy} />
          )}
          {active === "contact" && <ContactSection />}
        </main>
      </div>

      <Footer />
    </div>
  );
}

function ProfileSection({ draft, onChange, onSave, onReset, canSubmit, status }) {
  const initials = profileInitials(draft);

  return (
    <section className="max-w-2xl bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold">แก้ไขโปรไฟล์</h1>
        {status && (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            {status}
          </span>
        )}
      </div>
      <div className="border-b border-gray-200 mb-8"></div>

      <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-600">
          {initials}
        </div>
        <p className="text-sm text-gray-500 mt-3 md:mt-0">
          จะรองรับการอัปโหลดรูปโปรไฟล์ได้ในภายหลัง
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Field
          label="ชื่อ-นามสกุล"
          value={draft.fullName}
          onChange={(value) => onChange("fullName", value)}
          placeholder="ชื่อจริงของคุณ"
        />
        <Field
          label="ชื่อเล่น"
          value={draft.nickname}
          onChange={(value) => onChange("nickname", value)}
          placeholder="ชื่อที่เพื่อนเรียก"
        />
        <Field
          label="คณะ / หน่วยงาน"
          value={draft.faculty}
          onChange={(value) => onChange("faculty", value)}
          placeholder="ตัวอย่าง: คณะวิศวกรรมศาสตร์"
        />
        <Field
          label="เบอร์โทรศัพท์"
          value={draft.phone}
          onChange={(value) => onChange("phone", value)}
          placeholder="0xx-xxx-xxxx"
        />
        <Field
          label="อีเมล"
          value={draft.email}
          onChange={(value) => onChange("email", value)}
          placeholder="you@example.com"
        />
        <Field
          label="แนะนำตัว"
          value={draft.bio}
          onChange={(value) => onChange("bio", value)}
          placeholder="เล่าเกี่ยวกับสิ่งที่คุณสนใจเพื่อให้เพื่อนๆ รู้จักคุณมากขึ้น"
          multiline
        />
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="rounded-full border border-black/10 px-10 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onReset}
          disabled={!canSubmit}
        >
          คืนค่าเดิม
        </button>
        <button
          type="button"
          className="rounded-full bg-[#e84c3d] px-10 py-2.5 font-semibold text-white transition hover:bg-[#d63a2b] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onSave}
          disabled={!canSubmit}
        >
          บันทึกโปรไฟล์
        </button>
      </div>
    </section>
  );
}

function NotificationsSection({ values, onToggle }) {
  const items = [
    {
      key: "follow",
      title: "กิจกรรมจากคณะหรือชมรมที่ติดตาม",
      description: "แจ้งเตือนทันทีเมื่อมีกิจกรรมใหม่จากรายการที่คุณติดตาม",
    },
    {
      key: "near",
      title: "กิจกรรมใกล้เริ่ม",
      description: "แจ้งเตือนก่อนกิจกรรมเริ่มต้นเพื่อให้คุณไม่พลาดเวลาสำคัญ",
    },
    {
      key: "soon",
      title: "กิจกรรมที่จองไว้",
      description: "สรุปรายการที่คุณกดสนใจหรือเข้าร่วม เพื่อวางแผนล่วงหน้า",
    },
    {
      key: "recommend",
      title: "กิจกรรมแนะนำ",
      description: "คัดกิจกรรมที่ตรงกับความสนใจของคุณส่งให้เป็นพิเศษ",
    },
    {
      key: "announce",
      title: "ประกาศจาก MeetMeet",
      description: "ข่าวสารอัปเดตฟีเจอร์ใหม่และการบำรุงรักษาระบบ",
    },
  ];

  return (
    <section className="max-w-3xl bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/10">
      <h1 className="text-2xl font-semibold mb-2">การแจ้งเตือน</h1>
      <p className="text-sm text-gray-500 mb-6">
        ปรับแต่งประเภทการแจ้งเตือนที่คุณต้องการรับ ระบบจะบันทึกให้อัตโนมัติทันที
      </p>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <div key={item.key} className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-gray-800">{item.title}</p>
              <p className="text-sm text-gray-500">{item.description}</p>
            </div>
            <Toggle checked={values[item.key]} onChange={() => onToggle(item.key)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ThemeSection({ selected, onSelect }) {
  return (
    <section className="max-w-2xl bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/10">
      <h1 className="text-2xl font-semibold mb-2">ธีมหน้าจอ</h1>
      <p className="text-sm text-gray-500 mb-6">
        เลือกโหมดการแสดงผลที่คุณต้องการ ระบบจะจดจำค่าที่เลือกไว้ให้
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {THEME_OPTIONS.map((option) => {
          const isActive = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              className={`relative rounded-xl border-2 p-4 text-left transition ${
                isActive
                  ? "border-[#e84c3d] shadow-sm"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              style={{ background: option.color }}
            >
              <span className="text-sm font-semibold text-gray-800 block mb-1">
                {option.label}
              </span>
              <span className="text-xs text-gray-600 block leading-relaxed">
                {option.description}
              </span>
              {isActive && (
                <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e84c3d] text-xs font-bold text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PrivacySection({ values, onToggle }) {
  return (
    <section className="max-w-2xl bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/10">
      <h1 className="text-2xl font-semibold mb-2">ความเป็นส่วนตัว</h1>
      <p className="text-sm text-gray-500 mb-6">
        กำหนดว่าข้อมูลใดจะแสดงให้ผู้อื่นเห็นได้บ้าง
      </p>
      <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
        <div>
          <p className="font-medium text-gray-800">เปิดเผยกิจกรรมที่คุณถูกใจ</p>
          <p className="text-sm text-gray-500">
            หากปิดไว้ ผู้อื่นจะไม่เห็นลิสต์กิจกรรมที่คุณเคยกดถูกใจ
          </p>
        </div>
        <Toggle checked={values.showFavorites} onChange={() => onToggle("showFavorites")} />
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="max-w-2xl bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-black/10">
      <h1 className="text-2xl font-semibold mb-2">ติดต่อเรา</h1>
      <p className="text-sm text-gray-500 mb-6">
        หากพบปัญหาในการใช้งานหรือต้องการให้ทีมงานช่วยเหลือ สามารถติดต่อผ่านช่องทางด้านล่าง
      </p>
      <ul className="space-y-3 text-gray-700">
        {CONTACT_ITEMS.map((item) => (
          <li key={item.label} className="flex items-start gap-3">
            <span className="text-xl leading-none">{item.icon}</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">{item.label}</p>
              <p className="text-sm text-gray-500">{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Field({ label, value, onChange, placeholder, multiline = false }) {
  const InputComponent = multiline ? "textarea" : "input";
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-700">{label}</span>
      <InputComponent
        className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-[#e84c3d] focus:outline-none focus:ring-2 focus:ring-[#e84c3d]/40 ${
          multiline ? "min-h-[120px] resize-none" : ""
        }`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span className="h-6 w-11 rounded-full bg-gray-200 transition peer-checked:bg-[#e84c3d]"></span>
      <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5"></span>
    </label>
  );
}
