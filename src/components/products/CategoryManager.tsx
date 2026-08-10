import React, { useState } from 'react';
import { Category } from '../../types/database.types';
import { Plus, X, Tag, CheckCircle2, XCircle } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (name: string) => void;
  onUpdateCategory: (params: { id: string; name: string; is_active: boolean }) => void;
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  onClose,
}) => {
  const [newCatName, setNewCatName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1c1b1b] border border-[#52443d] rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#353534] pb-3">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-[#fab895]" />
            <h3 className="font-bold text-sm text-[#e5e2e1]">Manage Menu Categories</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#9f8d85] hover:text-[#e5e2e1] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Create new category input */}
        <form onSubmit={handleAdd} className="flex space-x-2">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="New Category Name (e.g. Desserts)"
            className="flex-1 bg-[#131313] border border-[#353534] rounded-xl px-3 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#fab895]"
          />
          <button
            type="submit"
            className="bg-[#6e4025] hover:bg-[#804b2b] text-[#eeae8b] border border-[#fab895]/30 px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </form>

        {/* Existing categories list */}
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-[#131313] border border-[#2a2a2a] p-2.5 rounded-xl text-xs"
            >
              <span className="font-semibold text-[#e5e2e1]">{cat.name}</span>
              <button
                onClick={() =>
                  onUpdateCategory({ id: cat.id, name: cat.name, is_active: !cat.is_active })
                }
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                  cat.is_active
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {cat.is_active ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[#353534] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#131313] text-[#e5e2e1] rounded-xl text-xs font-semibold hover:bg-[#201f1f] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
