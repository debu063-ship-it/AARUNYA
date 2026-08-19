import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trophy,
  Clock,
  Trash2,
  Star,
  ChevronRight,
  ChevronDown,
  X,
  Users,
  Heart,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function CreateRoundModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const utils = trpc.useUtils();

  const createMutation = trpc.adminCommunity.createRound.useMutation({
    onSuccess: () => {
      toast.success("Round created!");
      utils.adminCommunity.listRounds.invalidate();
      onClose();
      setTitle("");
      setDescription("");
      setEndsAt("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !endsAt) {
      toast.error("Please fill in the title and end date");
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      endsAt: new Date(endsAt).toISOString(),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black">Create Design Round</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. August 2026 Drop"
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell the community what this round is about..."
              rows={3}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold tracking-wider uppercase text-muted-foreground block mb-1.5">Deadline *</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Round"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function RoundDesigns({ roundId }: { roundId: number }) {
  const { data: designs, isLoading } = trpc.adminCommunity.roundDesigns.useQuery({ roundId });
  const utils = trpc.useUtils();

  const deleteMutation = trpc.adminCommunity.deleteDesign.useMutation({
    onSuccess: () => {
      toast.success("Design deleted");
      utils.adminCommunity.roundDesigns.invalidate({ roundId });
      utils.adminCommunity.listRounds.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const featureMutation = trpc.adminCommunity.featureDesign.useMutation({
    onSuccess: (data) => {
      toast.success(data.featured ? "Design featured!" : "Design unfeatured");
      utils.adminCommunity.roundDesigns.invalidate({ roundId });
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />)}
      </div>
    );
  }

  if (!designs || designs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No designs submitted yet
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
      {designs.map((design) => (
        <div key={design.id} className="design-card">
          <div className="design-image relative">
            <img src={design.imageUrl} alt={design.title} className="w-full h-full object-cover" />
            {design.featured && <div className="winner-badge">🏆 Winner</div>}
          </div>
          <div className="p-3 space-y-2">
            <p className="text-sm font-semibold truncate">{design.title}</p>
            <p className="text-xs text-muted-foreground">by {design.submitterName}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3" fill="currentColor" /> {design.likeCount} likes
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant={design.featured ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs h-8"
                onClick={() => featureMutation.mutate({ designId: design.id })}
              >
                <Star className="w-3 h-3 mr-1" />
                {design.featured ? "Unfeat." : "Feature"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this design?")) {
                    deleteMutation.mutate({ designId: design.id });
                  }
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminCommunity() {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  const { data: rounds, isLoading } = trpc.adminCommunity.listRounds.useQuery();
  const utils = trpc.useUtils();

  const closeMutation = trpc.adminCommunity.closeRound.useMutation({
    onSuccess: () => {
      toast.success("Round closed! Winner auto-selected.");
      utils.adminCommunity.listRounds.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    voting: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    featured: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Community Designs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage design rounds, submissions, and pick winners</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Round
        </Button>
      </div>

      {/* Rounds list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : !rounds || rounds.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">No design rounds</h3>
          <p className="text-muted-foreground text-sm mb-4">Create your first community design challenge</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Round
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rounds.map((round) => (
            <div key={round.id} className="border border-border rounded-xl overflow-hidden bg-card">
              {/* Round header */}
              <button
                onClick={() => setExpandedRound(expandedRound === round.id ? null : round.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase ${statusColors[round.status] ?? statusColors.closed}`}>
                    {round.status}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm truncate">{round.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {round.designCount} designs
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Ends {new Date(round.endsAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {round.status === "active" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm("Close this round and auto-select the winner?")) {
                          closeMutation.mutate({ roundId: round.id });
                        }
                      }}
                    >
                      <Trophy className="w-3 h-3 mr-1" /> Close & Pick Winner
                    </Button>
                  )}
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedRound === round.id ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Expanded designs */}
              <AnimatePresence>
                {expandedRound === round.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-border"
                  >
                    <RoundDesigns roundId={round.id} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      <CreateRoundModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  );
}
