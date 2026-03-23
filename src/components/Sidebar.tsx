import { categories } from "../data/products";

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
}: SidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="sticky top-20">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          Categories
        </h3>
        <nav className="flex lg:flex-col gap-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                selectedCategory === category
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
