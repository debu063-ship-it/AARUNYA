import { trpc } from "@/lib/trpc";
import StorefrontLayout from "@/components/StorefrontLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronUp,
  Lightbulb,
  Palette,
  Shirt,
  MessageSquarePlus,
  X,
  ChevronDown,
  Layers,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { toast } from "sonner";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";

const SUGGESTION_TYPES = [
  { value: "new_design" as const, label: "New Design Idea", icon: Palette, desc: "Suggest a brand new type of clothing or design" },
  { value: "different_fabric" as const, label: "Different Fabric", icon: Layers, desc: "Want an existing design in a different material" },
  { value: "other" as const, label: "Other", icon: HelpCircle, desc: "Any other product suggestion or feedback" },
];

const TYPE_LABELS: Record<string, string> = {
  new_design: "New Design",
  different_fabric: "Different Fabric",
  other: "Other",
};

const TYPE_CSS: Record<string, string> = {
  new_design: "new-design",
  different_fabric: "different-fabric",
  other: "other",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  reviewed: "Reviewed",
  planned: "Planned",
  done: "Done",
};

function SuggestionCard({
  suggestion,
  index,
  isUpvoted,
  onUpvote,
  onRemoveUpvote,
  isAuthenticated,
}: {
  suggestion: any;
  index: number;
  isUpvoted: boolean;
  onUpvote: (id: number) => void;
  onRemoveUpvote: (id: number) => void;
  isAuthenticated: boolean;
}) {
  const handleUpvoteClick = () => {
    if (!isAuthenticated) return;
    if (isUpvoted) {
      onRemoveUpvote(suggestion.id);
    } else {
      onUpvote(suggestion.id);
    }
  };

  return (
    <motion.div
      className="suggestion-card"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <div className="flex gap-4">
        {/* Upvote column */}
        <button
          onClick={handleUpvoteClick}
          className={`upvote-btn shrink-0 ${isUpvoted ? "active" : ""}`}
          disabled={!isAuthenticated}
          title={isAuthenticated ? (isUpvoted ? "Remove upvote" : "Upvote") : "Login to upvote"}
        >
          <ChevronUp className={`w-4 h-4 upvote-icon ${isUpvoted ? "text-purple-500" : ""}`} />
          <span>{suggestion.upvoteCount}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`type-badge ${TYPE_CSS[suggestion.type] ?? "other"}`}>
              {TYPE_LABELS[suggestion.type] ?? suggestion.type}
            </span>
            <span className={`status-badge ${suggestion.status}`}>
              {STATUS_LABELS[suggestion.status] ?? suggestion.status}
            </span>
          </div>
          <h3 className="text-sm font-bold mb-1">{suggestion.title}</h3>
          {suggestion.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-3">{suggestion.description}</p>
          )}

          {/* Fabric request details */}
          {suggestion.type === "different_fabric" && (
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
              {suggestion.productName && (
                <span className="flex items-center gap-1">
                  <Shirt className="w-3 h-3" /> Product: <strong className="text-foreground">{suggestion.productName}</strong>
                </span>
              )}
              {suggestion.fabricOrMaterial && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Wanted in: <strong className="text-foreground">{suggestion.fabricOrMaterial}</strong>
                </span>
              )}
            </div>
          )}

          {/* Admin note */}
          {suggestion.adminNote && (
            <div className="mt-2 p-3 bg-muted rounded-lg border border-border">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-1 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Team Response
              </p>
              <p className="text-xs text-foreground">{suggestion.adminNote}</p>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground mt-2">
            by {suggestion.submitterName} · {new Date(suggestion.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SubmitSuggestionModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [type, setType] = useState<"new_design" | "different_fabric" | "other">("new_design");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fabricOrMaterial, setFabricOrMaterial] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  const { data: products } = trpc.products.list.useQuery({}, { enabled: type === "different_fabric" });

  const submitMutation = trpc.suggestions.submit.useMutation({
    onSuccess: () => {
      toast.success("Suggestion submitted! 🎉");
      setTitle(""); setDescription(""); setFabricOrMaterial("");
      setSelectedProductId(null); setSelectedProductName(""); setProductSearch("");
      onSuccess();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Please add a title"); return; }
    submitMutation.mutate({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      productId: selectedProductId ?? undefined,
      fabricOrMaterial: fabricOrMaterial.trim() || undefined,
    });
  };

  const filteredProducts = (products ?? []).filter((p: any) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black tracking-tight">Share Your Idea</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type selector */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-2">What type of suggestion?</label>
            <div className="grid grid-cols-1 gap-2">
              {SUGGESTION_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    type === t.value
                      ? "border-foreground bg-foreground/5"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <t.icon className={`w-5 h-5 shrink-0 ${type === t.value ? "text-foreground" : "text-muted-foreground"}`} />
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Linen blend summer shirt"
              maxLength={255}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your idea in detail..."
              maxLength={2000}
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>

          {/* Fabric-specific fields */}
          {type === "different_fabric" && (
            <>
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Which product?</label>
                {selectedProductName ? (
                  <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg border border-border">
                    <span className="text-sm font-medium">{selectedProductName}</span>
                    <button type="button" onClick={() => { setSelectedProductId(null); setSelectedProductName(""); }} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search for a product..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredProducts.slice(0, 8).map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => { setSelectedProductId(p.id); setSelectedProductName(p.name); setProductSearch(""); }}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors border-b border-border last:border-b-0"
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Desired fabric / material</label>
                <input
                  type="text"
                  value={fabricOrMaterial}
                  onChange={(e) => setFabricOrMaterial(e.target.value)}
                  placeholder="e.g. 100% cotton, linen, silk blend..."
                  maxLength={255}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitMutation.isPending || !title.trim()}
            className="w-full py-3.5 bg-foreground text-background font-bold text-xs tracking-widest uppercase hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit Suggestion"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Suggestions() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [sortBy, setSortBy] = useState<"upvotes" | "newest">("upvotes");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const utils = trpc.useUtils();
  const { data: suggestionsData, isLoading } = trpc.suggestions.list.useQuery({
    type: filterType !== "all" ? filterType : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    sortBy,
  });
  const { data: myUpvotes } = trpc.suggestions.myUpvotes.useQuery(undefined, { enabled: !!user });

  const upvoteMutation = trpc.suggestions.upvote.useMutation({
    onSuccess: () => { utils.suggestions.list.invalidate(); utils.suggestions.myUpvotes.invalidate(); },
  });
  const removeUpvoteMutation = trpc.suggestions.removeUpvote.useMutation({
    onSuccess: () => { utils.suggestions.list.invalidate(); utils.suggestions.myUpvotes.invalidate(); },
  });

  const upvotedSet = new Set(myUpvotes ?? []);
  const allSuggestions = suggestionsData ?? [];

  const handleUpvote = (id: number) => {
    if (!user) { setAuthModalOpen(true); return; }
    upvoteMutation.mutate({ suggestionId: id });
  };
  const handleRemoveUpvote = (id: number) => {
    removeUpvoteMutation.mutate({ suggestionId: id });
  };

  return (
    <StorefrontLayout>
      {/* ═══ Hero Section ═══ */}
      <section className="community-hero">
        <div className="relative z-10 container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-center md:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-widest uppercase mb-6">
                <Lightbulb className="w-3.5 h-3.5" />
                Suggestion Box
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight uppercase leading-[1.1]">
                Tell Us What
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                  You Want
                </span>
              </h1>
              <p className="mt-4 text-sm md:text-base opacity-70 max-w-md mx-auto md:mx-0">
                Suggest new designs, request your favourite piece in a different fabric, or share any product idea. Upvote the ones you agree with!
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button
                onClick={() => {
                  if (!user) { setAuthModalOpen(true); return; }
                  setShowSubmitModal(true);
                }}
                className="px-8 py-4 bg-white text-black font-bold text-xs tracking-widest uppercase hover:bg-gray-100 transition-all rounded-lg flex items-center gap-3 shadow-lg"
              >
                <MessageSquarePlus className="w-4 h-4" />
                Share Your Idea
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Submit Modal ═══ */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitSuggestionModal
            open={showSubmitModal}
            onClose={() => setShowSubmitModal(false)}
            onSuccess={() => utils.suggestions.list.invalidate()}
          />
        )}
      </AnimatePresence>

      {/* ═══ Suggestions Feed ═══ */}
      <section className="container py-10">
        {/* Filter bar */}
        <div className="filter-bar flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold tracking-wider uppercase">Suggestions</h2>
            <span className="text-xs text-muted-foreground font-semibold">{allSuggestions.length} ideas</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy("upvotes")}
                className={`text-xs font-semibold tracking-wider uppercase transition-colors ${sortBy === "upvotes" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Top
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`text-xs font-semibold tracking-wider uppercase transition-colors ${sortBy === "newest" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                Newest
              </button>
            </div>
            <span className="text-border">|</span>
            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-transparent text-xs font-semibold tracking-wider uppercase text-muted-foreground pr-4 cursor-pointer focus:outline-none hover:text-foreground"
            >
              <option value="all">All Types</option>
              <option value="new_design">New Design</option>
              <option value="different_fabric">Different Fabric</option>
              <option value="other">Other</option>
            </select>
            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-transparent text-xs font-semibold tracking-wider uppercase text-muted-foreground pr-4 cursor-pointer focus:outline-none hover:text-foreground"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="reviewed">Reviewed</option>
              <option value="planned">Planned</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>

        {/* Suggestions list */}
        {isLoading ? (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : allSuggestions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold mb-1">No suggestions yet</h3>
            <p className="text-muted-foreground text-sm">Be the first to share what you'd love to see from SlayPOP!</p>
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {allSuggestions.map((suggestion, i) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                index={i}
                isUpvoted={upvotedSet.has(suggestion.id)}
                onUpvote={handleUpvote}
                onRemoveUpvote={handleRemoveUpvote}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </section>

      <CustomerAuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </StorefrontLayout>
  );
}
