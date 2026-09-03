"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ConversationRecord, UIMessage } from "../types";

async function runtimeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/runtime${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
  return data as T;
}

interface ConversationsViewProps {
  installationId: string;
  characterName: string;
}

function getMessageText(message: UIMessage | undefined): string {
  if (!message || !message.parts) return "";
  return message.parts
    .filter((p) => p.type === "text" && typeof p.text === "string")
    .map((p) => p.text as string)
    .join(" ")
    .trim();
}

export function ConversationsView({ installationId, characterName }: ConversationsViewProps) {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const { data: usageData } = useQuery({
    queryKey: ["installation-usage", installationId],
    queryFn: () =>
      runtimeFetch<{
        installationId: string;
        periodStart: string;
        conversationCount: number;
        messageCount: number;
        limit: number;
      }>(`/installations/${installationId}/usage`),
    enabled: Boolean(installationId),
    refetchInterval: 15_000,
  });

  const { data: conversationsData } = useQuery({
    queryKey: ["installation-conversations", installationId],
    queryFn: () =>
      runtimeFetch<{ installationId: string; conversations: ConversationRecord[] }>(
        `/installations/${installationId}/conversations`
      ),
    enabled: Boolean(installationId),
    refetchInterval: 15_000,
  });

  const recentConversations = useMemo(
    () => conversationsData?.conversations ?? [],
    [conversationsData?.conversations]
  );

  const activeConversation = useMemo(() => {
    if (!recentConversations.length) return null;
    if (selectedConversationId) {
      return (
        recentConversations.find((c) => c.id === selectedConversationId) ??
        recentConversations[0] ??
        null
      );
    }
    return recentConversations[0] ?? null;
  }, [recentConversations, selectedConversationId]);

  return (
    <div className="conversations-dashboard-view" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Top: 30-Day Monthly Quota Meter */}
      <div
        className="usage-meter-card"
        style={{
          padding: "18px 24px",
          border: "2px solid var(--ink)",
          background: "var(--white)",
          boxShadow: "3.5px 3.5px 0px var(--ink)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.3rem" }}>⚡</span>
            <div>
              <strong
                style={{
                  fontSize: ".88rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  fontFamily: "var(--mono)",
                  display: "block",
                }}
              >
                Monthly Conversations Quota
              </strong>
              <span style={{ fontSize: ".72rem", color: "var(--muted)" }}>Free tier allowance refreshed each billing cycle</span>
            </div>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "1.05rem", fontWeight: 800 }}>
            {usageData?.conversationCount ?? 0} / {usageData?.limit ?? 99} used
          </span>
        </div>

        <div style={{ height: 14, width: "100%", background: "#f4f4f0", border: "2px solid var(--ink)", overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${Math.min(((usageData?.conversationCount ?? 0) / (usageData?.limit ?? 99)) * 100, 100)}%`,
              background:
                (usageData?.conversationCount ?? 0) >= (usageData?.limit ?? 99)
                  ? "#ef4444"
                  : (usageData?.conversationCount ?? 0) > 80
                    ? "#f59e0b"
                    : "var(--yellow)",
              transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".76rem", color: "var(--muted)", fontWeight: 600 }}>
          <span>Resets automatically every 30 days</span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontWeight: 700,
              color: (usageData?.conversationCount ?? 0) >= 99 ? "#ef4444" : "var(--ink)",
            }}
          >
            {Math.max((usageData?.limit ?? 99) - (usageData?.conversationCount ?? 0), 0)} conversations remaining
          </span>
        </div>
      </div>

      {/* Master-Detail Transcripts View */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 340px) 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Column: Thread List */}
        <div
          style={{
            border: "2px solid var(--ink)",
            background: "var(--white)",
            boxShadow: "3px 3px 0px var(--ink)",
            display: "flex",
            flexDirection: "column",
            maxHeight: "560px",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "2px solid var(--ink)",
              background: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <strong
              style={{
                fontSize: ".82rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                fontFamily: "var(--mono)",
              }}
            >
              Chat Threads ({recentConversations.length})
            </strong>
            <span style={{ fontSize: ".70rem", color: "var(--muted)", fontWeight: 600 }}>
              Live Activity
            </span>
          </div>

          <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", padding: 8, gap: 6, flex: 1 }}>
            {recentConversations.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--muted)", fontSize: ".80rem" }}>
                <p style={{ margin: "0 0 6px 0", fontSize: "1.4rem" }}>💬</p>
                <strong>No visitor chats yet</strong>
                <p style={{ margin: "6px 0 0 0", fontSize: ".74rem" }}>
                  When visitors talk to your mascot on your site, transcripts will appear here in real time.
                </p>
              </div>
            ) : (
              recentConversations.map((conv) => {
                const isSelected = activeConversation?.id === conv.id;
                const lastUser = [...conv.messages].reverse().find((m) => m.role === "user");
                const lastUserText = getMessageText(lastUser) || "Visitor conversation";
                const timeStr = new Date(conv.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                const dateStr = new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" });

                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => setSelectedConversationId(conv.id)}
                    style={{
                      padding: "10px 12px",
                      border: isSelected ? "2px solid var(--ink)" : "1.5px solid #e2e2dc",
                      background: isSelected ? "var(--yellow)" : "var(--white)",
                      boxShadow: isSelected ? "2px 2px 0px var(--ink)" : "none",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".74rem" }}>
                      <strong style={{ fontFamily: "var(--mono)", color: "var(--ink)" }}>
                        👤 Visitor ...{conv.visitorId.slice(-6)}
                      </strong>
                      <span style={{ fontSize: ".68rem", color: isSelected ? "var(--ink)" : "var(--muted)", fontWeight: 600 }}>
                        {dateStr} · {timeStr}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: ".74rem",
                        color: isSelected ? "var(--ink)" : "#555",
                        fontWeight: isSelected ? 600 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      &ldquo;{lastUserText}&rdquo;
                    </div>
                    <div
                      style={{
                        fontSize: ".66rem",
                        color: isSelected ? "var(--ink)" : "var(--muted)",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      {conv.messages.length} message{conv.messages.length === 1 ? "" : "s"}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Transcript Dialogue Inspector */}
        <div
          style={{
            border: "2px solid var(--ink)",
            background: "var(--white)",
            boxShadow: "3.5px 3.5px 0px var(--ink)",
            display: "flex",
            flexDirection: "column",
            minHeight: "440px",
            maxHeight: "560px",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: "2px solid var(--ink)",
              background: "var(--paper)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <strong
                style={{
                  fontSize: ".84rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  fontFamily: "var(--mono)",
                }}
              >
                {activeConversation ? `Transcript · Visitor ...${activeConversation.visitorId.slice(-6)}` : "Transcript Inspector"}
              </strong>
              {activeConversation && (
                <div style={{ fontSize: ".70rem", color: "var(--muted)", marginTop: 2 }}>
                  Last active {new Date(activeConversation.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
            {activeConversation && (
              <span
                style={{
                  padding: "3px 8px",
                  fontSize: ".68rem",
                  fontFamily: "var(--mono)",
                  background: "var(--ink)",
                  color: "#fff",
                  fontWeight: 800,
                }}
              >
                {activeConversation.messages.length} TURNS
              </span>
            )}
          </div>

          <div
            style={{
              padding: "16px 20px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
              background: "#fafaf8",
            }}
          >
            {!activeConversation ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--muted)", fontSize: ".82rem" }}>
                <p style={{ fontSize: "1.8rem", margin: "0 0 8px 0" }}>👁️</p>
                <strong>No conversation selected</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: ".76rem" }}>
                  Pick a visitor thread on the left to review the full turn-by-turn dialogue.
                </p>
              </div>
            ) : (
              activeConversation.messages.map((m, idx) => {
                const isUser = m.role === "user";
                const cleanText = getMessageText(m);
                if (!cleanText) return null;

                return (
                  <div
                    key={m.id || idx}
                    style={{
                      alignSelf: isUser ? "flex-start" : "flex-end",
                      maxWidth: "82%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: ".66rem",
                        fontFamily: "var(--mono)",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        color: isUser ? "var(--ink)" : "#4338ca",
                        alignSelf: isUser ? "flex-start" : "flex-end",
                      }}
                    >
                      {isUser ? "👤 Visitor" : `✨ ${characterName || "Mascot"}`}
                    </span>
                    <div
                      style={{
                        padding: "10px 14px",
                        fontSize: ".82rem",
                        lineHeight: "1.45",
                        border: "2px solid var(--ink)",
                        background: isUser ? "var(--white)" : "var(--yellow)",
                        boxShadow: "2px 2px 0px var(--ink)",
                        color: "var(--ink)",
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {cleanText}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Qualra Product Intelligence Bridge Banner ── */}
      <div
        style={{
          padding: "16px 20px",
          border: "2px solid var(--ink)",
          background: "var(--white)",
          boxShadow: "3.5px 3.5px 0px var(--ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, maxWidth: 650 }}>
          <span style={{ fontSize: "1.6rem" }}>🧠</span>
          <div>
            <strong style={{ fontSize: ".88rem", display: "block", color: "var(--ink)" }}>
              Turn visitor interactions into continuous roadmap evidence with Qualra.
            </strong>
            <p style={{ margin: "4px 0 0 0", fontSize: ".76rem", color: "var(--muted)", lineHeight: "1.4" }}>
              Cradle gives your website an interactive voice. Qualra&apos;s autonomous multi-agent team (Abby, Bob, Ivan &amp; Watcher) listens to your visitors, catches bugs, tracks customer memory across sessions, and syncs directly with Linear, Slack, and Jira.
            </p>
          </div>
        </div>
        <a
          href="https://www.qualra.xyz"
          target="_blank"
          rel="noreferrer"
          className="button primary"
          style={{
            padding: "10px 18px",
            fontSize: ".82rem",
            fontWeight: 800,
            whiteSpace: "nowrap",
            background: "var(--yellow)",
            color: "var(--ink)",
            border: "2px solid var(--ink)",
            boxShadow: "2px 2px 0px var(--ink)",
            textDecoration: "none",
          }}
        >
          Connect to Qualra Pro →
        </a>
      </div>
    </div>
  );
}
