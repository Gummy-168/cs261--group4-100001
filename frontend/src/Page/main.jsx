// =============================
function Header({ logoText, icons, dataSource, openInNewTab }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
	if (dataSource?.getNotificationCount) {
	  dataSource.getNotificationCount().then(setCount);
	}
  }, [dataSource]);

  return (
<header className="sticky top-0 z-40 bg-[#F0C744] text-black">
<div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
{/* Logo */}
<a href="/" className="font-extrabold text-xl tracking-tight select-none">{logoText}</a>


{/* Right icons */}
<nav className="flex items-center gap-4">
{/* Calendar */}
<a href="/calendar" target={openInNewTab ? '_blank' : undefined} rel={openInNewTab ? 'noopener noreferrer' : undefined} className="relative inline-flex">
<img src={icons.calendarSrc} alt="calendar" className="w-6 h-6" />
</a>


{/* Bell with badge */}
<a href="/notifications" target={openInNewTab ? '_blank' : undefined} rel={openInNewTab ? 'noopener noreferrer' : undefined} className="relative inline-flex">
<img src={icons.bellSrc} alt="notifications" className="w-6 h-6" />
{count > 0 && (
<span aria-label={`มีการแจ้งเตือน ${count} รายการ`} className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] leading-4 text-center">
{Math.min(count, 9)}
</span>
)}
</a>


{/* Search */}
<a href="/search" target={openInNewTab ? '_blank' : undefined} rel={openInNewTab ? 'noopener noreferrer' : undefined} className="relative inline-flex">
<img src={icons.searchSrc} alt="search" className="w-6 h-6" />
</a>


<a href="/login" className="ml-2 text-sm font-medium">เข้าสู่ระบบ</a>
</nav>
</div>
</header>
)
}


Header.propTypes = {
logoText: PropTypes.string,
icons: PropTypes.shape({ calendarSrc: PropTypes.string, bellSrc: PropTypes.string, searchSrc: PropTypes.string }),
dataSource: PropTypes.shape({ getNotificationCount: PropTypes.func }),
openInNewTab: PropTypes.bool,
}