import { Book, Heart, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "../assets/logo3.png";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="rounded-full bg-primary/10 p-6">
              <img src={logo} alt="Stashy Logo" className="w-75 object-contain" />
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t("home.title")}
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.subtitle").split("\n").map((i) => (<span key={i.length}>{i}<br /></span>))}
          </p>

          <div className="flex flex-col items-center gap-4 mb-16">
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
              <Input
                type="text"
                placeholder={t("home.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                <Search className="mr-2 h-4 w-4" />
                {t("common.search")}
              </Button>
            </form>
            <div className="text-muted-foreground text-sm">{t("home.or")}</div>
            <GoogleLoginButton />
          </div>
        </div>
      </div>
    </div>
  );
}
