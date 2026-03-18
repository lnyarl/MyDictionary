import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/common/SEO";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/logo3.png";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const WORD_POOL = [
  // 감성/감정
  "설렘", "그리움", "포근함", "두근두근", "따스함", "애틋함", "뭉클함", "벅참",
  "아련함", "서늘함", "허전함", "쓸쓸함", "울컥", "떨림", "홀가분함",
  // 일상/보통
  "습관", "루틴", "눈치", "핑계", "타협", "체면", "고집", "눈총",
  "잔소리", "버릇", "여유", "기분", "실수", "집중", "마감",
  // 딱딱하고 진지한
  "의무", "책임", "갈등", "모순", "아집", "후회", "각오", "결단",
  "원칙", "신념", "의지", "한계", "극복", "인내", "집착",
  // 관계
  "신뢰", "배신", "오해", "화해", "질투", "경쟁", "의존", "독립",
  "위로", "응원", "눈빛", "침묵", "거리감", "밀당", "공감",
  // 시간/공간
  "새벽", "황혼", "골목", "창가", "이별", "귀환", "여정", "흔적",
  "기억", "망각", "순간", "영원", "낯섦", "익숙함", "변화",
  // 재미/유머
  "멘붕", "현타", "갓생", "눈팅", "덕질", "취향", "TMI", "공감",
  "반전", "어이없음", "허허", "찐친", "브이로그",
];

function getRandomWords(pool: string[], count: number): string[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedWords] = useState(() => getRandomWords(WORD_POOL, 12));

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/feed");
    }
  }, [isAuthenticated, navigate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?term=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#8aab8b] border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <SEO />
      <div className="relative min-h-screen overflow-hidden bg-[#faf9f6] flex flex-col items-center justify-center px-4 py-16">

        {/* Background blobs */}
        <div
          className="absolute top-[-8%] left-[-6%] w-[480px] h-[480px] rounded-full opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #c8e6c9 0%, #e8f5e9 60%, transparent 100%)",
            filter: "blur(60px)",
            animation: "blob 9s ease-in-out infinite",
          }}
        />
        <div
          className="absolute top-[15%] right-[-8%] w-[420px] h-[420px] rounded-full opacity-45 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #d8b4fe 0%, #ede9fe 60%, transparent 100%)",
            filter: "blur(60px)",
            animation: "blob 11s ease-in-out infinite",
            animationDelay: "2s",
          }}
        />
        <div
          className="absolute bottom-[5%] left-[25%] w-[380px] h-[380px] rounded-full opacity-40 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #fed7aa 0%, #fff7ed 60%, transparent 100%)",
            filter: "blur(55px)",
            animation: "blob 13s ease-in-out infinite",
            animationDelay: "4s",
          }}
        />
        <div
          className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full opacity-35 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #fbcfe8 0%, #fdf2f8 60%, transparent 100%)",
            filter: "blur(50px)",
            animation: "blob 10s ease-in-out infinite",
            animationDelay: "6s",
          }}
        />

        {/* Main content */}
        <div className="relative z-10 w-full max-w-md text-center">

          {/* Logo */}
          <div
            className="flex justify-center mb-10"
            style={{ animation: "float 4s ease-in-out infinite" }}
          >
            <div className="rounded-full bg-white/75 backdrop-blur-sm shadow-xl p-5 border border-white/60">
              <img src={logo} alt="Stashy Logo" className="w-20 h-20 object-contain" />
            </div>
          </div>

          {/* Slogan */}
          <h1 className="text-5xl font-bold mb-4 tracking-tight" style={{ color: "#3a5c3b" }}>
            {t("home.title")}
          </h1>

          {/* Subtitle */}
          <p className="text-lg mb-12 leading-relaxed" style={{ color: "#7a9e7b" }}>
            {t("home.subtitle")}
          </p>

          {/* Search card */}
          <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-white/80 p-6 mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder={t("home.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 rounded-full border-[#d4e8d5] bg-white/80 focus-visible:ring-[#8aab8b] placeholder:text-[#bdd4be]"
              />
              <Button
                type="submit"
                className="rounded-full px-5 bg-[#6b9e6d] hover:bg-[#5c8f5e] text-white border-none shadow-md"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[#e8f0e8]" />
              <span className="text-xs text-[#a8c4a9]">{t("home.or")}</span>
              <div className="flex-1 h-px bg-[#e8f0e8]" />
            </div>

            <div className="flex justify-center">
              <GoogleLoginButton />
            </div>
          </div>

          {/* Floating word chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {displayedWords.map((word, i) => (
              <span
                key={word}
                className="px-4 py-1.5 bg-white/65 backdrop-blur-sm rounded-full text-sm border border-white/80 shadow-sm cursor-default select-none"
                style={{
                  color: "#7a9e7b",
                  animation: `float-chip ${3.5 + (i % 4) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${(i * 0.3) % 2}s`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
