import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Mail, Clock, CheckCircle2, MessageSquare, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminMessages() {
  const { data: messages, isLoading, refetch } = trpc.contact.list.useQuery();
  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Message status updated");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update status");
    },
  });

  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const handleMarkStatus = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" /> Customer Messages
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Incoming support queries and feedback submitted through the Contact Us page.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="gap-2 rounded-xl text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : !messages || messages.length === 0 ? (
        <div className="border border-border/60 bg-card rounded-2xl p-12 text-center space-y-3">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/30" />
          <h3 className="font-bold text-base">No messages yet</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When customers submit inquiries via the Contact Us form, they will appear here and in your email.
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* List column */}
          <div className="lg:col-span-1 space-y-3">
            {messages.map((msg: any) => {
              const isSelected = selectedMessage?.id === msg.id;
              const isUnread = msg.status === "unread";
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (isUnread) {
                      handleMarkStatus(msg.id, "read");
                    }
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs"
                      : "border-border/60 bg-card hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-foreground truncate max-w-[160px]">
                      {msg.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        msg.status === "unread"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : msg.status === "replied"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground/90 truncate mb-1">
                    {msg.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{msg.email}</span>
                    <span>
                      {msg.createdAt ? format(new Date(msg.createdAt), "MMM d, h:mm a") : ""}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Details column */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="border border-border/60 bg-card rounded-2xl p-6 space-y-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                  <div>
                    <h2 className="text-xl font-black tracking-tight">{selectedMessage.subject}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Received on{" "}
                      {selectedMessage.createdAt
                        ? format(new Date(selectedMessage.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")
                        : "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMessage.status !== "replied" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkStatus(selectedMessage.id, "replied")}
                        className="text-xs rounded-xl gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Mark as Replied
                      </Button>
                    )}
                    <a
                      href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                        selectedMessage.subject
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" className="text-xs rounded-xl gap-1.5">
                        <Mail className="w-3.5 h-3.5" /> Reply by Email
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Sender card */}
                <div className="grid sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-0.5 font-medium">Customer Name</span>
                    <strong className="text-foreground">{selectedMessage.name}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5 font-medium">Customer Email</span>
                    <a
                      href={`mailto:${selectedMessage.email}`}
                      className="text-primary font-bold hover:underline"
                    >
                      {selectedMessage.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-0.5 font-medium">Order Number</span>
                    <strong className="text-foreground">
                      {selectedMessage.orderNumber ? `#${selectedMessage.orderNumber}` : "None provided"}
                    </strong>
                  </div>
                </div>

                {/* Message Body */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message Body
                  </h3>
                  <div className="p-5 rounded-2xl bg-muted/20 border border-border/40 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[300px] border border-border/60 bg-card rounded-2xl p-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                <Mail className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-semibold">Select a message from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
