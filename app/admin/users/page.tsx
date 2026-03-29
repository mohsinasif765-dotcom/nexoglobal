"use client";
import { useState, useEffect, useCallback } from "react";
// 1. SSR compatible client import kiya
import { createBrowserClient } from "@supabase/ssr"; 
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserX, UserCheck, ShieldAlert, Phone, Loader2, X, Clock, Ban, TrendingUp } from "lucide-react";

export default function UserManagement() {
  // 2. Client ko component ke andar initialize kiya taake cookies update hon
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'blocked'>('active');
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [confirmToggle, setConfirmToggle] = useState<{id: string, currentStatus: string, action: string} | null>(null);
  const [upgradeUser, setUpgradeUser] = useState<any | null>(null);
  const [selectedTier, setSelectedTier] = useState("starter");
  const [upgrading, setUpgrading] = useState(false);

  const LIMIT = 10;

  const fetchUsers = useCallback(async (currentOffset: number, query: string, isNewSearch: boolean, status: string) => {
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);

    try {
      // Supabase RPC call wahi rakhi hai
      const { data, error } = await supabase.rpc('get_users_paginated_v2', {
        search_query: query,
        page_limit: LIMIT,
        page_offset: currentOffset,
        status_filter: status 
      });

      if (error) throw error;

      if (isNewSearch) {
        setUsers(data.users || []);
      } else {
        setUsers(prev => [...prev, ...(data.users || [])]);
      }
      setHasMore(data.hasMore);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [supabase]); // Supabase dependency add ki hai

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(0);
      fetchUsers(0, search, true, activeTab);
    }, 500);
    return () => clearTimeout(timer);
  }, [search, activeTab, fetchUsers]);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextOffset = offset + LIMIT;
    setOffset(nextOffset);
    fetchUsers(nextOffset, search, false, activeTab);
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userId));
      setConfirmToggle(null);
      alert(`User marked as ${newStatus}`);
    } catch (e: any) {
      alert("Update Failed: " + e.message);
    }
  };

  const handleAdminUpgrade = async () => {
    if (!upgradeUser) return;
    setUpgrading(true);
    try {
      const { data, error } = await supabase.rpc('admin_assign_tier_v2', {
        p_user_id: upgradeUser.id,
        p_tier: selectedTier
      });

      if (error) throw error;
      
      if (data.success) {
        alert(data.message);
        setUpgradeUser(null);
        fetchUsers(0, search, true, activeTab);
      } else {
        alert("Alert: " + data.message);
      }
    } catch (e: any) {
      alert("Upgrade Failed: " + e.message);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="p-6 pb-32">
      <header className="mb-6">
        <h1 className="text-3xl font-black italic tracking-tighter text-gray-900 uppercase">Member Control</h1>
        <p className="text-primary text-[10px] font-bold uppercase tracking-[0.3em]">Network Access Management</p>
      </header>

      {/* TABS SYSTEM */}
      <div className="flex bg-gray-100 p-1.5 rounded-[22px] mb-8">
        {(['active', 'pending', 'blocked'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="relative mb-8 group">
        <Search className="absolute left-5 top-4.5 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab} members...`} 
          className="w-full bg-white border border-gray-100 p-4.5 pl-14 rounded-[25px] outline-none focus:ring-4 focus:ring-primary/5 shadow-sm font-bold text-gray-700 transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Filtering Members...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-100">
             <UserX size={40} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-400 font-bold italic text-sm">No {activeTab} members found.</p>
          </div>
        ) : (
          <>
            {users.map((user) => (
              <motion.div layout key={user.id} className="bg-white border border-gray-100 p-5 rounded-[35px] shadow-sm flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-[22px] ${user.status === 'active' ? 'bg-emerald-50 text-emerald-500' : user.status === 'pending' ? 'bg-orange-50 text-orange-500' : 'bg-red-50 text-red-500'}`}>
                    {user.status === 'active' ? <UserCheck size={24} /> : user.status === 'pending' ? <Clock size={24} /> : <Ban size={24} />}
                  </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-lg leading-tight text-gray-800">{user.full_name}</h4>
                        <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter italic">
                           {user.phone} • {user.referral_code}
                        </p>
                      </div>
                      <div className="flex gap-1">
                         {activeTab === 'pending' && (
                           <button onClick={() => handleUpdateStatus(user.id, 'active')} className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><UserCheck size={16} /></button>
                         )}
                         {activeTab !== 'blocked' && (
                           <button onClick={() => handleUpdateStatus(user.id, 'blocked')} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Ban size={16} /></button>
                         )}
                         {activeTab === 'blocked' && (
                           <button onClick={() => handleUpdateStatus(user.id, 'active')} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><UserCheck size={16} /></button>
                         )}
                         <button 
                           onClick={() => setUpgradeUser(user)} 
                           className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-all"
                           title="Assign Plan"
                         >
                           <TrendingUp size={16} />
                         </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                       <div className="bg-bg-light p-3 rounded-2xl border border-gray-50">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Balance</p>
                          <p className="text-sm font-black text-primary">${user.wallet_balance?.toLocaleString()}</p>
                       </div>
                       <div className="bg-bg-light p-3 rounded-2xl border border-gray-50">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Pairs</p>
                          <p className="text-sm font-black text-gray-700">{user.total_pairs}</p>
                       </div>
                       <div className="bg-bg-light p-3 rounded-2xl border border-gray-50">
                          <p className="text-[8px] font-black text-gray-400 uppercase mb-0.5">Withdrawn</p>
                          <p className="text-sm font-black text-orange-600">${user.total_withdrawn?.toLocaleString()}</p>
                       </div>
                    </div>
                  </div>
              </motion.div>
            ))}
            {hasMore && (
              <button onClick={loadMore} className="w-full py-5 text-gray-400 font-black text-xs uppercase tracking-widest italic">
                {loadingMore ? <Loader2 className="animate-spin mx-auto" size={20} /> : "Load More"}
              </button>
            )}
          </>
        )}
      </div>
      {/* UPGRADE MODAL */}
      <AnimatePresence>
        {upgradeUser && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 border border-white/20 shadow-2xl"
            >
              <h3 className="text-xl font-black italic tracking-tighter text-gray-900 uppercase mb-2">Assign Plan</h3>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-6">User: {upgradeUser.full_name}</p>
              
              <div className="space-y-3 mb-8">
                {['starter', 'plus', 'pro', 'elite'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full p-4 rounded-2xl flex justify-between items-center transition-all border-2 ${
                      selectedTier === tier 
                      ? 'bg-purple-50 border-purple-600 text-purple-700' 
                      : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-black uppercase text-xs italic">{tier}</span>
                    {selectedTier === tier && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setUpgradeUser(null)}
                  disabled={upgrading}
                  className="flex-1 py-4 font-black text-[10px] uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAdminUpgrade}
                  disabled={upgrading}
                  className="flex-1 py-4 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {upgrading ? <Loader2 className="animate-spin" size={14} /> : "ASSIGN PLAN"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}