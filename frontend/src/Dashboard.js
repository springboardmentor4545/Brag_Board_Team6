// src/Dashboard.js
import React, { useState, useMemo, useEffect } from "react";
import dayjs from "dayjs";

/*
  Self-contained interactive Dashboard (dummy data).
  - No external icon or chart libraries (uses inline SVG & CSS)
  - Props: user (current user object), token (string), onLogout (fn)
*/

function IconThumb({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M14 9V5a3 3 0 0 0-3-3l-3 7v7h6.5a2.5 2.5 0 0 0 2.45-2.0L17.9 9.7A2 2 0 0 0 16.2 9H14z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 21v-9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconClap({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M12 3l1.5 3.5L17 8l-3 1.5L13 13l-2-3.5L8 9l2-1.5L11 3z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6 14l-1 6h14l-1-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconStar({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M12 2l2.6 6.3L21 9l-5 3.7L17.2 21 12 17.6 6.8 21 8 12.7 3 9l6.4-.7L12 2z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconMessage({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="inline-block">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function Avatar({ name, size = 40 }) {
  const initials = (name || "U").split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase();
  return (
    <div style={{width:size, height:size}} className="flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-teal-400 text-white font-bold">
      {initials}
    </div>
  );
}

export default function Dashboard({ user = { name: "You", department: "General", role: "employee" }, token = null, onLogout = () => {} }) {
  // ----- Local dummy data (interactive) -----
  const [users, setUsers] = useState([
    { id: 1, name: "Aarav Sharma", department: "HR" },
    { id: 2, name: "Neha Patel", department: "Engineering" },
    { id: 3, name: "Rohan Desai", department: "Marketing" },
    { id: 4, name: "Priya Mehta", department: "Sales" },
    { id: 5, name: "Soham Sawant", department: "Product" },
  ]);

  const initialShoutouts = [
    {
      id: 101,
      sender: users[1],
      recipients: [users[0]],
      message: "Neha shipped the API improvements — massive speed up! 🚀",
      created_at: dayjs().subtract(2, "day").toISOString(),
      reactions: { like: 8, clap: 3, star: 1 },
      reacted_by: { /* userId: ['like','clap'] */ },
      comments: [
        { id: 1, user: users[2], text: "Fantastic work!" },
      ],
      flagged: false
    },
    {
      id: 102,
      sender: users[3],
      recipients: [users[1], users[4]],
      message: "Priya and Soham crushed the client demo presentation — stellar teamwork. ✨",
      created_at: dayjs().subtract(6, "hour").toISOString(),
      reactions: { like: 5, clap: 4, star: 2 },
      reacted_by: {},
      comments: [],
      flagged: false
    },
  ];

  const [shoutouts, setShoutouts] = useState(initialShoutouts);
  const [activePostId, setActivePostId] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [filter, setFilter] = useState({ dept: "all", search: "" });
  const [showNewModal, setShowNewModal] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [newRecipients, setNewRecipients] = useState([]);
  const [isAdminView, setIsAdminView] = useState(user?.role === "admin");

  // ----- Derived values -----
  const departments = useMemo(() => ["all", ...Array.from(new Set(users.map(u => u.department)))], [users]);

  const filtered = useMemo(() => {
    const q = filter.search.trim().toLowerCase();
    return shoutouts.filter(s => {
      if (filter.dept !== "all") {
        const senderDept = s.sender?.department || "";
        const recDeptMatch = (s.recipients || []).some(r => r.department === filter.dept);
        if (senderDept !== filter.dept && !recDeptMatch) return false;
      }
      if (!q) return true;
      if (s.message.toLowerCase().includes(q)) return true;
      if (s.sender?.name?.toLowerCase().includes(q)) return true;
      if ((s.recipients || []).some(r => r.name.toLowerCase().includes(q))) return true;
      return false;
    }).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }, [shoutouts, filter]);

  // ----- Actions (local-only) -----
  const toggleReaction = (postId, type) => {
    setShoutouts(prev => prev.map(s => {
      if (s.id !== postId) return s;
      const userId = 9999; // local demo user id (client)
      const reacted = (s.reacted_by[userId] || []).includes(type);
      const nextReactions = { ...s.reactions };
      const nextReacted = { ...s.reacted_by };
      nextReacted[userId] = [...(nextReacted[userId] || [])];
      if (reacted) {
        // remove
        nextReacted[userId] = nextReacted[userId].filter(r => r !== type);
        nextReactions[type] = Math.max(0, (nextReactions[type] || 0) - 1);
      } else {
        nextReacted[userId].push(type);
        nextReactions[type] = (nextReactions[type] || 0) + 1;
      }
      return { ...s, reactions: nextReactions, reacted_by: nextReacted };
    }));
  };

  const addComment = (postId) => {
    if (!commentText.trim()) return;
    setShoutouts(prev => prev.map(s => {
      if (s.id !== postId) return s;
      const comment = {
        id: Date.now(),
        user: { id: 9999, name: user?.name || "You" },
        text: commentText.trim()
      };
      return { ...s, comments: [...s.comments, comment] };
    }));
    setCommentText("");
  };

  const postNewShoutout = () => {
    if (!newMessage.trim()) return;
    const newPost = {
      id: Date.now(),
      sender: { id: 9999, name: user?.name || "You", department: user?.department || "General"},
      recipients: users.filter(u => newRecipients.includes(u.id)),
      message: newMessage.trim(),
      created_at: new Date().toISOString(),
      reactions: { like: 0, clap: 0, star: 0 },
      reacted_by: {},
      comments: [],
      flagged: false
    };
    setShoutouts(prev => [newPost, ...prev]);
    setShowNewModal(false);
    setNewMessage("");
    setNewRecipients([]);
  };

  const deletePost = (postId) => {
    setShoutouts(prev => prev.filter(s => s.id !== postId));
  };

  const flagPost = (postId) => {
    setShoutouts(prev => prev.map(s => s.id === postId ? {...s, flagged: true} : s));
  };

  // ----- Leaderboard & simple analytics -----
  const leaderboard = useMemo(() => {
    const points = {};
    shoutouts.forEach(s => {
      const sid = s.sender?.name || "Unknown";
      points[sid] = (points[sid] || 0) + 5; // sending gives 5 pts
      (s.recipients || []).forEach(r => points[r.name] = (points[r.name] || 0) + 2);
      Object.values(s.reactions || {}).forEach(v => { /* reactions add implicitly to count */ });
    });
    return Object.entries(points).map(([name, pts]) => ({ name, pts })).sort((a,b) => b.pts - a.pts).slice(0,5);
  }, [shoutouts]);

  const deptCounts = useMemo(() => {
    const map = {};
    shoutouts.forEach(s => {
      const dept = s.sender?.department || "General";
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).map(([dept, count]) => ({ dept, count }));
  }, [shoutouts]);

  // ----- simple auth-redirect guard (client-only) -----
  useEffect(() => {
    // If there's no token passed as prop, we stay in demo mode but do not redirect.
    // In your real app, you can navigate to /login here if you want.
  }, [token]);

  // ----- small helpers -----
  const timeAgo = (iso) => {
    return dayjs(iso).fromNow ? dayjs(iso).fromNow() : dayjs(iso).format("MMM D, h:mm A");
  };

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: profile & quick */}
        <aside className="lg:col-span-3 hidden lg:block">
          <div className="bg-white rounded-xl shadow p-4 space-y-4 sticky top-6">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name || "You"} size={56} />
              <div>
                <div className="font-semibold">{user?.name || "You"}</div>
                <div className="text-xs text-gray-500">{user?.department || "No dept"} • {user?.role || "employee"}</div>
              </div>
            </div>

            <div className="pt-2">
              <button onClick={() => setShowNewModal(true)} className="w-full text-sm bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 rounded-lg">Post Shoutout</button>
            </div>

            <div className="border-t pt-3 text-sm text-gray-600 space-y-2">
              <div className="flex justify-between">
                <div>Connections</div>
                <div className="font-semibold">128</div>
              </div>
              <div className="flex justify-between">
                <div>Kudos received</div>
                <div className="font-semibold">84</div>
              </div>
            </div>

            <div className="border-t pt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">Switch View</div>
              <div>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={isAdminView} onChange={() => setIsAdminView(v => !v)} />
                  <span className="text-xs">Admin</span>
                </label>
              </div>
            </div>

            <div className="border-t pt-3">
              <button onClick={onLogout} className="w-full py-2 rounded bg-red-600 text-white text-sm">Log out</button>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-600 font-semibold mb-2">Quick Filters</div>
            <select className="w-full p-2 rounded border" value={filter.dept} onChange={(e) => setFilter(f => ({...f, dept: e.target.value}))}>
              {departments.map(d => <option key={d} value={d}>{d === "all" ? "All departments" : d}</option>)}
            </select>
            <input placeholder="Search..." value={filter.search} onChange={(e)=> setFilter(f=>({...f, search:e.target.value}))} className="w-full mt-2 p-2 rounded border" />
          </div>
        </aside>

        {/* CENTER: Feed */}
        <main className="lg:col-span-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recognition Feed</h2>
            <div className="text-sm text-gray-500">{filtered.length} posts</div>
          </div>

          {/* Create area for small screens */}
          <div className="bg-white rounded-xl shadow p-4 mb-4 lg:hidden">
            <div className="flex items-start gap-3">
              <Avatar name={user?.name} size={40} />
              <div className="flex-1">
                <textarea value={newMessage} onChange={(e)=> setNewMessage(e.target.value)} placeholder="Share praise or a quick update..." className="w-full p-2 rounded border resize-none" rows={2} />
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-500">Tag teammates:</div>
                  <div>
                    <button onClick={() => setShowNewModal(true)} className="text-sm text-blue-600">Open composer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feed list */}
          <div className="space-y-4">
            {filtered.map(post => (
              <article key={post.id} className={`bg-white rounded-2xl p-4 shadow ${post.flagged ? "ring-2 ring-red-300" : ""}`}>
                <div className="flex gap-3">
                  <Avatar name={post.sender?.name} size={48} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{post.sender?.name}</div>
                        <div className="text-xs text-gray-500">{post.sender?.department} • {dayjs(post.created_at).format("MMM D, h:mm A")}</div>
                      </div>
                      {isAdminView && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => flagPost(post.id)} className="text-xs px-2 py-1 bg-yellow-200 rounded">Flag</button>
                          <button onClick={() => deletePost(post.id)} className="text-xs px-2 py-1 bg-red-200 rounded">Delete</button>
                        </div>
                      )}
                    </div>

                    <p className="mt-3 text-gray-800">{post.message}</p>

                    <div className="mt-3 text-sm text-gray-600">
                      To: <strong className="text-gray-800">{(post.recipients || []).map(r => r.name).join(", ") || "All"}</strong>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <button onClick={() => toggleReaction(post.id, "like")} className={`flex items-center gap-2 px-2 py-1 rounded ${ (post.reacted_by[9999] || []).includes("like") ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}>
                        <IconThumb /> <span>{post.reactions.like || 0}</span>
                      </button>

                      <button onClick={() => toggleReaction(post.id, "clap")} className={`flex items-center gap-2 px-2 py-1 rounded ${ (post.reacted_by[9999] || []).includes("clap") ? "bg-yellow-100 text-yellow-700" : "hover:bg-gray-100"}`}>
                        <IconClap /> <span>{post.reactions.clap || 0}</span>
                      </button>

                      <button onClick={() => toggleReaction(post.id, "star")} className={`flex items-center gap-2 px-2 py-1 rounded ${ (post.reacted_by[9999] || []).includes("star") ? "bg-pink-100 text-pink-600" : "hover:bg-gray-100"}`}>
                        <IconStar /> <span>{post.reactions.star || 0}</span>
                      </button>

                      <button onClick={() => setActivePostId(post.id === activePostId ? null : post.id)} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ml-auto text-gray-500">
                        <IconMessage /> <span>{(post.comments || []).length} comments</span>
                      </button>
                    </div>

                    {/* Comments */}
                    {activePostId === post.id && (
                      <div className="mt-3 border-t pt-3 space-y-2">
                        {(post.comments || []).length === 0 ? <div className="text-xs text-gray-500">No comments yet — add one!</div> : (
                          (post.comments || []).map(c => (
                            <div key={c.id} className="text-sm bg-gray-50 p-2 rounded">
                              <div className="text-xs text-gray-600"><strong>{c.user?.name}</strong></div>
                              <div className="text-gray-800">{c.text}</div>
                            </div>
                          ))
                        )}

                        <div className="flex gap-2 mt-2">
                          <input value={commentText} onChange={(e)=> setCommentText(e.target.value)} placeholder="Write a comment..." className="flex-1 p-2 rounded border" />
                          <button onClick={() => addComment(post.id)} className="bg-blue-600 text-white px-3 py-2 rounded">Reply</button>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow">No shoutouts yet — be the first to post 🎉</div>}
          </div>
        </main>

        {/* RIGHT: analytics & leaderboard */}
        <aside className="lg:col-span-3 hidden lg:block sticky top-6 self-start">
          <div className="bg-white rounded-xl shadow p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Leaderboard</div>
                <div className="font-semibold text-lg">Top Contributors</div>
              </div>
              <div className="text-xs text-gray-500">This week</div>
            </div>

            <ul className="mt-3 space-y-2">
              {leaderboard.map((l, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">{idx===0 ? "🥇" : idx===1 ? "🥈" : idx===2 ? "🥉" : (idx+1)}</div>
                    <div>
                      <div className="font-semibold text-sm">{l.name}</div>
                      <div className="text-xs text-gray-500">Points: {l.pts}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-600">{l.pts}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-sm text-gray-600 font-semibold mb-3">Shoutouts by Department</div>
            <div className="space-y-3">
              {deptCounts.length === 0 && <div className="text-xs text-gray-500">No data</div>}
              {deptCounts.map((d, i) => {
                const max = Math.max(...deptCounts.map(x => x.count), 1);
                const pct = Math.round((d.count / max) * 100);
                return (
                  <div key={i} className="text-sm">
                    <div className="flex justify-between mb-1 text-xs text-gray-600">
                      <div>{d.dept}</div>
                      <div>{d.count}</div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div style={{ width: `${pct}%` }} className="h-2 bg-gradient-to-r from-indigo-500 to-teal-400"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Floating compose button (desktop) */}
      <button onClick={() => setShowNewModal(true)} className="fixed right-6 bottom-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hidden md:flex items-center gap-3">
        <svg width="18" height="18" viewBox="0 0 24 24" className="inline-block">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        New
      </button>

      {/* New shoutout modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Avatar name={user?.name} size={48} />
                <div>
                  <div className="font-semibold">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.department || "No dept"}</div>
                </div>
              </div>
              <button onClick={() => setShowNewModal(false)} className="text-gray-500">Close</button>
            </div>

            <textarea value={newMessage} onChange={(e)=> setNewMessage(e.target.value)} rows={4} placeholder="Write your shoutout..." className="w-full mt-4 p-3 border rounded resize-none" />

            <div className="mt-3">
              <div className="text-xs text-gray-600 mb-2">Tag teammates (click to toggle)</div>
              <div className="flex flex-wrap gap-2">
                {users.map(u => (
                  <button key={u.id} onClick={() => setNewRecipients(prev => prev.includes(u.id) ? prev.filter(x=>x!==u.id) : [...prev, u.id])}
                    className={`px-3 py-1 rounded-full border ${newRecipients.includes(u.id) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">Preview</div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setNewMessage(""); setNewRecipients([]); }} className="text-sm text-gray-600">Clear</button>
                <button onClick={postNewShoutout} className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 p-3 rounded">
              <div className="font-semibold text-sm">{user?.name} → {newRecipients.length ? users.filter(u=>newRecipients.includes(u.id)).map(u=>u.name).join(", ") : "All"}</div>
              <div className="text-sm text-gray-800 mt-2">{newMessage || <span className="text-gray-400">Your message preview will appear here...</span>}</div>
              <div className="text-xs text-gray-400 mt-2">{newMessage ? dayjs().format("MMM D, YYYY h:mm A") : ""}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
