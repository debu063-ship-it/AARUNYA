import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Upload, Clock, Trophy, Sparkles, ImagePlus, X, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";

function CountdownTimer({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calcTime = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      };
    };
    setTimeLeft(calcTime());
    const timer = setInterval(() => setTimeLeft(calcTime()), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);

  return (
    <div className="countdown-timer">
      {[
        { value: timeLeft.days, label: "Days" },
        { value: timeLeft.hours, label: "Hours" },
        { value: timeLeft.minutes, label: "Min" },
        { value: timeLeft.seconds, label: "Sec" },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-3">
          {i > 0 && <span className="countdown-separator">:</span>}
          <div className="countdown-unit">
            <span className="countdown-value">{String(unit.value).padStart(2, "0")}</span>
            <span className="countdown-label">{unit.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DesignCard({
  design,
  index,
  isLiked,
  onLike,
  onUnlike,
  isAuthenticated,
}: {
  design: any;
  index: number;
  isLiked: boolean;
  onLike: (id: number) => void;
  onUnlike: (id: number) => void;
  isAuthenticated: boolean;
}) {
  const [animating, setAnimating] = useState(false);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    if (isLiked) {
      onUnlike(design.id);
    } else {
      onLike(design.id);
    }
  };

  return (
    <motion.div
      className="design-card group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <div className="design-image relative">
        <img src={design.imageUrl} alt={design.title} loading="lazy" />
        {design.featured && <div className="winner-badge">🏆 Winner</div>}
      </div>
      <div className="design-info">
        <p className="design-title">{design.title}</p>
        <p className="design-author">by {design.submitterName}</p>
        {design.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{design.description}</p>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={handleLikeClick}
            className={`like-btn ${isLiked ? "active" : ""}`}
            disabled={!isAuthenticated}
            title={isAuthenticated ? (isLiked ? "Unlike" : "Like this design") : "Login to like"}
          >
            <Heart
              className={`w-4 h-4 like-icon ${animating ? "scale-125" : ""}`}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span>{design.likeCount}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function SubmitDesignForm({ onSuccess }: { onSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitMutation = trpc.community.submitDesign.useMutation({
    onSuccess: () => {
      toast.success("Design submitted! 🎉");
      setTitle("");
      setDescription("");
      setFile(null);
      setPreview(null);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleFileChange = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileChange(f);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Please add a title and an image");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      submitMutation.mutate({
        title: title.trim(),
        description: description.trim() || undefined,
        file: base64,
        filename: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Upload zone */}
      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />
        {preview ? (
          <div className="relative inline-block">
            <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs hover:opacity-80"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center">
              <ImagePlus className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Drop your design here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse · PNG, JPG up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Design title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={255}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
      />

      {/* Description */}
      <textarea
        placeholder="Describe your design concept (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={1000}
        rows={3}
        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
      />

      {/* Submit */}
      <button
        type="submit"
        disabled={submitMutation.isPending || !file || !title.trim()}
        className="w-full py-3.5 bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
      >
        {submitMutation.isPending ? "Uploading..." : "Submit Design"}
      </button>
    </form>
  );
}

export default function Community() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [sortBy, setSortBy] = useState<"likes" | "newest">("likes");

  const utils = trpc.useUtils();
  const { data: roundData, isLoading: roundLoading } = trpc.community.activeRound.useQuery();
  const { data: myLikes } = trpc.community.myLikes.useQuery(
    { roundId: roundData?.id ?? 0 },
    { enabled: !!user && !!roundData?.id }
  );
  const { data: pastWinners } = trpc.community.featuredWinners.useQuery();

  const likeMutation = trpc.community.likeDesign.useMutation({
    onSuccess: () => utils.community.activeRound.invalidate(),
  });
  const unlikeMutation = trpc.community.unlikeDesign.useMutation({
    onSuccess: () => utils.community.activeRound.invalidate(),
  });

  const likedSet = new Set(myLikes ?? []);

  const handleLike = (designId: number) => {
    if (!user) { setAuthModalOpen(true); return; }
    likeMutation.mutate({ designId });
  };

  const handleUnlike = (designId: number) => {
    unlikeMutation.mutate({ designId });
  };

  const designs = roundData?.designs ?? [];
  const sortedDesigns = [...designs].sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return b.likeCount - a.likeCount;
  });

  const isRoundActive = roundData?.status === "active";
  const hasRound = !!roundData;

  return (
    <StorefrontLayout>
      {/* ═══ Hero Section ═══ */}
      <section className="community-hero">
        <div className="relative z-10 container">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-widest uppercase mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Community Design Challenge
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1]">
                  Design the
                  <br />
                  <span className="bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Next Drop
                  </span>
                </h1>
                <p className="mt-4 text-sm md:text-base opacity-70 max-w-md mx-auto lg:mx-0">
                  Submit your designs, get the most likes, and see your creation become SlayPOP's next outfit drop.
                </p>
              </motion.div>

              {hasRound && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6"
                >
                  <p className="text-xs font-semibold tracking-wider uppercase opacity-50 mb-3">
                    {isRoundActive ? "Round ends in" : "Round ended"}
                  </p>
                  {isRoundActive && <CountdownTimer endsAt={roundData.endsAt} />}
                  <p className="text-sm font-semibold mt-3 opacity-80">{roundData.title}</p>
                </motion.div>
              )}
            </div>

            {/* Submit CTA */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex-shrink-0"
            >
              {isRoundActive && (
                <button
                  onClick={() => {
                    if (!user) { setAuthModalOpen(true); return; }
                    setShowSubmitForm(true);
                  }}
                  className="px-8 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-gray-100 transition-all rounded-lg flex items-center gap-3 shadow-lg"
                >
                  <Upload className="w-4 h-4" />
                  Submit Your Design
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Submit Modal Overlay ═══ */}
      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSubmitForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black tracking-tight">Submit Your Design</h2>
                <button onClick={() => setShowSubmitForm(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SubmitDesignForm onSuccess={() => {
                setShowSubmitForm(false);
                utils.community.activeRound.invalidate();
              }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Design Gallery ═══ */}
      <section className="container py-10">
        {roundLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !hasRound ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-black mb-2">No Active Round</h2>
            <p className="text-muted-foreground text-sm">Check back soon — the next design challenge is coming!</p>
          </div>
        ) : (
          <>
            {/* Sort bar */}
            <div className="filter-bar">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold tracking-wider uppercase">Submissions</h2>
                <span className="text-xs text-muted-foreground font-semibold">{designs.length} designs</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSortBy("likes")}
                  className={`text-xs font-semibold tracking-wider uppercase transition-colors ${sortBy === "likes" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Most Liked
                </button>
                <button
                  onClick={() => setSortBy("newest")}
                  className={`text-xs font-semibold tracking-wider uppercase transition-colors ${sortBy === "newest" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Newest
                </button>
              </div>
            </div>

            {/* Grid */}
            {sortedDesigns.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedDesigns.map((design, i) => (
                  <DesignCard
                    key={design.id}
                    design={design}
                    index={i}
                    isLiked={likedSet.has(design.id)}
                    onLike={handleLike}
                    onUnlike={handleUnlike}
                    isAuthenticated={!!user}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ImagePlus className="w-7 h-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-1">No designs yet</h3>
                <p className="text-muted-foreground text-sm">Be the first to submit your design!</p>
              </div>
            )}
          </>
        )}
      </section>

      {/* ═══ Past Winners ═══ */}
      {pastWinners && pastWinners.length > 0 && (
        <section className="border-t border-border">
          <div className="container py-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-black tracking-tight uppercase">Past Winners</h2>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto snap-x pb-4" style={{ scrollbarWidth: "none" }}>
              {pastWinners.map((winner, i) => (
                <motion.div
                  key={winner.id}
                  className="flex-shrink-0 w-56 design-card snap-start"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="design-image relative">
                    <img src={winner.imageUrl} alt={winner.title} loading="lazy" />
                    <div className="winner-badge">🏆 Winner</div>
                  </div>
                  <div className="design-info">
                    <p className="design-title">{winner.title}</p>
                    <p className="design-author">by {winner.submitterName}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Heart className="w-3 h-3" fill="currentColor" />
                      {winner.likeCount} likes
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ How It Works ═══ */}
      <section className="border-t border-border bg-muted/30">
        <div className="container py-12">
          <h2 className="text-lg font-black tracking-tight uppercase text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { step: "01", title: "Submit", desc: "Upload your design concept during an active round", icon: Upload },
              { step: "02", title: "Vote", desc: "Like your favourite community designs", icon: Heart },
              { step: "03", title: "Win", desc: "The most-liked design becomes the next SlayPOP drop", icon: Trophy },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-muted-foreground tracking-widest mb-1">{item.step}</div>
                <h3 className="text-sm font-bold mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </StorefrontLayout>
  );
}
