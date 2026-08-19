import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  MessageCircle,
  ChevronUp,
  Shirt,
  Layers,
  X,
  Filter,
} from "lucide-react";
import { motion } from "framer-motion";

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

const STATUS_OPTIONS = ["open", "reviewed", "planned", "done"] as const;

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  reviewed: "Reviewed",
  planned: "Planned",
  done: "Done",
};

function AdminNoteModal({ open, onClose, suggestionId, currentNote }: {
  open: boolean;
  onClose: () => void;
  suggestionId: number;
  currentNote: string | null;
}) {
  const [note, setNote] = useState(currentNote ?? "");
  const utils = trpc.useUtils();

  const addNoteMutation = trpc.adminSuggestions.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note saved");
      utils.adminSuggestions.list.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-background border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Admin Response</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write a response to this suggestion..."
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors resize-none mb-4"
        />
        <Button
          className="w-full"
          onClick={() => addNoteMutation.mutate({ id: suggestionId, note: note.trim() })}
          disabled={addNoteMutation.isPending || !note.trim()}
        >
          {addNoteMutation.isPending ? "Saving..." : "Save Response"}
        </Button>
      </motion.div>
    </div>
  );
}

export default function AdminSuggestions() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [noteModal, setNoteModal] = useState<{ open: boolean; id: number; note: string | null }>({ open: false, id: 0, note: null });

  const { data: suggestions, isLoading } = trpc.adminSuggestions.list.useQuery({
    type: filterType !== "all" ? filterType : undefined,
    status: filterStatus !== "all" ? filterStatus : undefined,
    sortBy: "newest",
  });
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.adminSuggestions.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.adminSuggestions.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.adminSuggestions.delete.useMutation({
    onSuccess: () => {
      toast.success("Suggestion deleted");
      utils.adminSuggestions.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const statusColors: Record<string, string> = {
    open: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    planned: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    done: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Customer Suggestions</h1>
        <p className="text-sm text-muted-foreground mt-1">Review customer ideas, update statuses, and respond</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground"
        >
          <option value="all">All Types</option>
          <option value="new_design">New Design</option>
          <option value="different_fabric">Different Fabric</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-foreground"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="reviewed">Reviewed</option>
          <option value="planned">Planned</option>
          <option value="done">Done</option>
        </select>
        <span className="text-xs text-muted-foreground">{suggestions?.length ?? 0} suggestions</span>
      </div>

      {/* Suggestions list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : !suggestions || suggestions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded-xl">
          <h3 className="text-lg font-bold mb-1">No suggestions</h3>
          <p className="text-muted-foreground text-sm">Customer ideas will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion, i) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="border border-border rounded-xl p-4 bg-card"
            >
              <div className="flex gap-4">
                {/* Upvote count */}
                <div className="shrink-0 flex flex-col items-center justify-center px-2">
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-black">{suggestion.upvoteCount}</span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">votes</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`type-badge ${TYPE_CSS[suggestion.type] ?? "other"}`}>
                      {TYPE_LABELS[suggestion.type] ?? suggestion.type}
                    </span>

                    {/* Status dropdown */}
                    <select
                      value={suggestion.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: suggestion.id, status: e.target.value as any })}
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md border-0 cursor-pointer focus:outline-none ${statusColors[suggestion.status] ?? statusColors.open}`}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </div>

                  <h3 className="text-sm font-bold mb-1">{suggestion.title}</h3>
                  {suggestion.description && (
                    <p className="text-xs text-muted-foreground mb-2">{suggestion.description}</p>
                  )}

                  {/* Fabric details */}
                  {suggestion.type === "different_fabric" && (
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
                      {suggestion.productName && (
                        <span className="flex items-center gap-1">
                          <Shirt className="w-3 h-3" /> <strong>{suggestion.productName}</strong>
                        </span>
                      )}
                      {suggestion.fabricOrMaterial && (
                        <span className="flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Wanted in: <strong>{suggestion.fabricOrMaterial}</strong>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Admin note */}
                  {suggestion.adminNote && (
                    <div className="mt-2 p-2.5 bg-muted rounded-lg text-xs">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground mb-1">Your Response</p>
                      <p>{suggestion.adminNote}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-[11px] text-muted-foreground">
                      by {suggestion.submitterName} · {new Date(suggestion.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={() => setNoteModal({ open: true, id: suggestion.id, note: suggestion.adminNote })}
                      >
                        <MessageCircle className="w-3 h-3" /> Reply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this suggestion?")) {
                            deleteMutation.mutate({ id: suggestion.id });
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AdminNoteModal
        open={noteModal.open}
        onClose={() => setNoteModal({ open: false, id: 0, note: null })}
        suggestionId={noteModal.id}
        currentNote={noteModal.note}
      />
    </div>
  );
}
