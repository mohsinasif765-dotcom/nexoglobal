"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ShieldCheck, AlertCircle, Loader2, 
  ZoomIn, ZoomOut, Maximize, UserPlus, PlusCircle, Move
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

// --- TYPES ---
interface TreeNodeData {
  id: string;
  parent_id?: string;
  name: string;
  username: string;
  status: "active" | "inactive" | "pending";
  left_count: number;
  right_count: number;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  isExpanding?: boolean;
}

export default function MyTree() {
  const router = useRouter();
  const constraintsRef = useRef(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [selectedTier, setSelectedTier] = useState("starter");
  const [loading, setLoading] = useState(true);
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNodeData | null>(null);
  const [zoom, setZoom] = useState(0.7);

  const handleZoom = (type: "in" | "out" | "reset") => {
    if (type === "in") setZoom(prev => Math.min(prev + 0.2, 2));
    if (type === "out") setZoom(prev => Math.max(prev - 0.2, 0.3));
    if (type === "reset") setZoom(0.7);
  };

  const injectBranch = (node: TreeNodeData | null, targetId: string, subTree: TreeNodeData): TreeNodeData | null => {
    if (!node) return null;
    if (node.id === targetId) {
      return { ...node, left: subTree.left, right: subTree.right, isExpanding: false };
    }
    return {
      ...node,
      left: injectBranch(node.left || null, targetId, subTree),
      right: injectBranch(node.right || null, targetId, subTree)
    };
  };

  const buildTreeStructure = (list: any[], rootId: string) => {
    const nodeMap = new Map();
    list.forEach(item => {
      nodeMap.set(item.id, {
        ...item,
        name: item.full_name,
        username: item.referral_code,
        left: null,
        right: null
      });
    });

    let rootNode = null;
    list.forEach(item => {
      const currentNode = nodeMap.get(item.id);
      if (item.id === rootId) rootNode = currentNode;
      else {
        const parent = nodeMap.get(item.parent_id);
        if (parent) {
          if (item.placement === 'left') parent.left = currentNode;
          else parent.right = currentNode;
        }
      }
    });
    return rootNode;
  };

  const fetchNodeData = useCallback(async (userId: string, isExpanding = false, tier = selectedTier) => {
    if (isExpanding) {
      setTreeData(prev => {
        if (!prev) return null;
        const setLoad = (n: TreeNodeData): TreeNodeData => {
          if (n.id === userId) return { ...n, isExpanding: true };
          return { ...n, left: n.left ? setLoad(n.left) : null, right: n.right ? setLoad(n.right) : null };
        };
        return setLoad(prev);
      });
    }

    try {
      const { data: flatList, error } = await supabase.rpc('get_binary_tree_pro', {
        root_id: userId,
        p_tier: tier
      });
      if (error) throw error;

      if (flatList && flatList.length > 0) {
        const subTree = buildTreeStructure(flatList, userId);
        if (isExpanding && subTree) {
          setTreeData(prev => injectBranch(prev, userId, subTree));
        } else {
          setTreeData(subTree);
        }
      } else {
        setTreeData(null);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      if (!isExpanding) setLoading(false);
    }
  }, [supabase, selectedTier]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      fetchNodeData(user.id, false, selectedTier);
    };
    init();
  }, [selectedTier, fetchNodeData, supabase, router]);

  return (
    <div className="min-h-screen bg-bg-app flex flex-col overflow-hidden relative transition-colors duration-300" ref={constraintsRef}>
      <header className="bg-bg-card/80 backdrop-blur-xl sticky top-0 z-40 border-b border-app pt-10 pb-4 px-5 transition-colors duration-300">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2.5 bg-bg-app rounded-2xl border border-app text-text-dim hover:text-text-app active:scale-90 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h1 className="text-sm font-black text-text-app uppercase tracking-tighter italic">Binary Network</h1>
            <div className="flex items-center justify-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
               <p className="text-[8px] text-text-dim font-black uppercase tracking-widest italic">Global Rewards System</p>
            </div>
          </div>
          <button onClick={() => handleZoom("reset")} className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 active:scale-95 transition-all">
            <Maximize size={18} />
          </button>
        </div>

        {/* Tier Switcher */}
        <div className="flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide border-t border-app/50 pt-4">
          {["starter", "plus", "pro", "elite"].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-5 py-2.5 rounded-xl font-black text-[9px] uppercase italic transition-all border-2 shrink-0 ${selectedTier === tier ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-bg-card border-app text-text-dim active:scale-95'}`}
            >
              {tier}
            </button>
          ))}
        </div>
      </header>

      {/* FLOATING CONTROLS */}
      <div className="fixed right-6 top-48 flex flex-col gap-3 z-40">
        <button onClick={() => handleZoom("in")} className="p-5 bg-bg-card rounded-[24px] shadow-2xl border border-app text-text-app active:scale-90 transition-all backdrop-blur-md"><ZoomIn size={22}/></button>
        <button onClick={() => handleZoom("out")} className="p-5 bg-bg-card rounded-[24px] shadow-2xl border border-app text-text-app active:scale-90 transition-all backdrop-blur-md"><ZoomOut size={22}/></button>
      </div>

      <main className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-app/80 backdrop-blur-sm z-30">
            <Loader2 className="animate-spin text-primary" size={44} />
            <p className="text-[10px] font-black text-text-dim mt-5 uppercase tracking-widest italic">Syncing Tree Data...</p>
          </div>
        ) : !treeData ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-bg-card border border-app rounded-full flex items-center justify-center mb-6 text-text-dim opacity-30 shadow-inner">
              <UserPlus size={40} />
            </div>
            <h3 className="text-xl font-black text-text-app uppercase italic mb-2 tracking-tighter">Tier Not Active</h3>
            <p className="text-[10px] text-text-dim font-black uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
              You are not yet a member of the {selectedTier} network. Please activate for this tier.
            </p>
          </div>
        ) : (
          <motion.div 
            drag 
            dragConstraints={{ left: -3000, right: 3000, top: -3000, bottom: 3000 }}
            dragElastic={0.05}
            className="w-full h-full cursor-grab active:cursor-grabbing flex justify-center items-start pt-40"
            style={{ touchAction: 'none' }}
          >
            <motion.div animate={{ scale: zoom }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="origin-top">
              <TreeNode node={treeData} onNodeClick={setSelectedNode} onExpand={fetchNodeData} />
            </motion.div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {selectedNode && (
          <NodeModal node={selectedNode} onClose={() => setSelectedNode(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function TreeNode({ node, onNodeClick, onExpand }: { node: any, onNodeClick: (n: any) => void, onExpand: (id: string, exp: boolean) => void }) {
  if (!node) return (
    <div className="flex flex-col items-center opacity-20 scale-50">
      <div className="w-16 h-16 rounded-full border-4 border-dashed border-app flex items-center justify-center">
        <UserPlus size={24} className="text-text-dim" />
      </div>
    </div>
  );

  const needsExpansion = (node.left_count > 0 || node.right_count > 0) && (!node.left && !node.right);

  return (
    <div className="flex flex-col items-center relative">
      <div className="mb-6 flex gap-3 items-center bg-slate-900 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-2xl border border-white/10 italic">
        <span className="text-emerald-400">L: {node.left_count}</span>
        <div className="w-[1px] h-3 bg-white/20"></div>
        <span className="text-blue-400">R: {node.right_count}</span>
      </div>

      <motion.div 
        whileHover={{ y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onNodeClick(node)}
        className={`relative z-10 w-24 h-24 rounded-[35px] flex flex-col items-center justify-center border-[3px] shadow-2xl cursor-pointer bg-bg-card transition-colors duration-300
          ${node.status === 'active' ? 'border-primary shadow-primary/20' : 'border-indigo-400 shadow-indigo-400/20'}
        `}
      >
        <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-2xl font-black text-white mb-1 shadow-inner
          ${node.status === 'active' ? 'bg-gradient-to-br from-primary to-indigo-900' : 'bg-gradient-to-br from-indigo-300 to-indigo-500 text-indigo-950'}
        `}>
          {node.isExpanding ? <Loader2 size={18} className="animate-spin" /> : (node.name?.charAt(0) || '?')}
        </div>
        <div className={`absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center border-4 border-bg-card shadow-xl ${node.status === 'active' ? 'bg-primary' : 'bg-indigo-300'}`}>
          {node.status === 'active' ? <ShieldCheck size={18} className="text-white" /> : <AlertCircle size={18} className="text-indigo-900" />}
        </div>
      </motion.div>

      <div className="mt-5 relative">
         <div className="absolute inset-0 bg-primary/10 blur-[20px] rounded-full scale-150 -z-10" />
         <p className="text-[11px] font-black text-text-app bg-bg-card border border-app px-6 py-2.5 rounded-2xl shadow-xl tracking-tighter uppercase italic min-w-[100px] text-center">
           {node.username}
         </p>
      </div>

      <div className="flex flex-col items-center">
        <div className="h-12 w-[2px] bg-gradient-to-b from-app to-transparent"></div>
        {needsExpansion ? (
          <motion.button
            whileHover={{ scale: 1.3, rotate: 90 }}
            whileTap={{ scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onExpand(node.id, true); }}
            className="bg-primary text-white p-2.5 rounded-full shadow-2xl shadow-primary/40 active:scale-90 transition-all z-20 border-4 border-bg-app hover:bg-slate-900 dark:hover:bg-white dark:hover:text-slate-900"
          >
            <PlusCircle size={32} />
          </motion.button>
        ) : (
          <div className="flex">
            <div className="flex flex-col items-center">
              <div className="w-full h-[2px] bg-app relative left-1/2"></div>
              <div className="h-12 w-[2px] bg-app"></div>
              <div className="px-14">
                <TreeNode node={node.left} onNodeClick={onNodeClick} onExpand={onExpand} />
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-[2px] bg-app relative right-1/2"></div>
              <div className="h-12 w-[2px] bg-app"></div>
              <div className="px-14">
                <TreeNode node={node.right} onNodeClick={onNodeClick} onExpand={onExpand} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NodeModal({ node, onClose }: { node: any, onClose: () => void }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-xl" />
      <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="fixed bottom-0 left-0 right-0 bg-bg-card rounded-t-[50px] p-10 z-[110] shadow-3xl border-t border-app max-w-2xl mx-auto overflow-hidden transition-colors duration-300">
        <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-10" />
        <div className="flex items-center gap-6 mb-12">
          <div className="w-20 h-20 rounded-[30px] bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner border border-primary/20">
            {node.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="text-3xl font-black text-text-app tracking-tighter uppercase italic leading-none mb-2">{node.name}</h3>
            <p className="text-[10px] font-black text-text-dim tracking-[0.4em] uppercase">{node.username}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-5 mb-12">
          <div className="bg-emerald-500/5 p-8 rounded-[40px] border border-emerald-500/20 text-center shadow-sm">
            <p className="text-[10px] font-black text-emerald-500 uppercase mb-3 tracking-widest flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               Left Network
            </p>
            <p className="text-4xl font-black text-text-app italic tracking-tighter leading-none">{node.left_count || 0}</p>
          </div>
          <div className="bg-blue-500/5 p-8 rounded-[40px] border border-blue-500/20 text-center shadow-sm">
            <p className="text-[10px] font-black text-blue-500 uppercase mb-3 tracking-widest flex items-center justify-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
               Right Network
            </p>
            <p className="text-4xl font-black text-text-app italic tracking-tighter leading-none">{node.right_count || 0}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-slate-900 dark:bg-white text-white dark:text-gray-900 py-7 rounded-[35px] font-black italic text-xs shadow-2xl active:scale-95 transition-all uppercase tracking-[0.3em] border border-white/10 dark:border-black/5">CLOSE VISUALIZER</button>
      </motion.div>
    </>
  );
}