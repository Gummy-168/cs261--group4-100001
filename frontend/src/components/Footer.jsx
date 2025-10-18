import LogoMeetMeet from "../assets/img/Logo_MeetMeet.png";

export default function Footer({ className = "" }) {
  return (
    <footer className={`border-t border-black/10 bg-[#f6c556] ${className}`}>
      <div className="mx-auto flex max-w-8/10 flex-col gap-6 px-4 py-8 text-sm text-black/80 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-2 font-semibold">
          <img src={LogoMeetMeet} alt="MeetMeet" className="h-7 w-auto" />
        </div>
        <div className="text-xs md:text-sm">© 2025 MeetMeet, Inc. สงวนลิขสิทธิ์ทั้งหมด</div>
        <div className="flex gap-5 text-xs font-medium md:text-sm">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Support</a>
        </div>
      </div>
    </footer>
  );
}
