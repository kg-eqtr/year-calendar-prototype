import type { CategoryGroup } from "../types";

interface CategoryBarProps {
  groups: CategoryGroup[];
  activeCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
  onToggleGroup: (groupName: string) => void;
  onClearAll: () => void;
}

export default function CategoryBar({
  groups,
  activeCategories,
  onToggleCategory,
  onToggleGroup,
  onClearAll,
}: CategoryBarProps) {
  const allSelected = groups.every((g) =>
    g.items.every((item) => activeCategories.has(item.name))
  );

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 px-4 py-3 bg-white border-b border-gray-200"
      role="toolbar"
      aria-label="Category filters">
      <button
        onClick={() => {
          if (allSelected) {
            onClearAll();
          } else {
            groups.forEach((g) =>
              g.items.forEach((item) => {
                if (!activeCategories.has(item.name)) {
                  onToggleCategory(item.name);
                }
              })
            );
          }
        }}
        aria-pressed={allSelected}
        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-1 ${
          allSelected
            ? "bg-gray-800 text-white border-gray-800"
            : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
        }`}
      >
        All categories
      </button>

      {groups.map((group) => {
        const groupActive = group.items.every((item) =>
          activeCategories.has(item.name)
        );

        return (
          <div key={group.name} className="flex items-center gap-1.5" role="group" aria-label={`${group.name} categories`}>
            <span className="mx-1 text-gray-300" aria-hidden="true">|</span>
            <button
              onClick={() => onToggleGroup(group.name)}
              aria-pressed={groupActive}
              aria-label={`Toggle all ${group.name} categories`}
              className={`px-2 py-1 text-xs font-bold cursor-pointer transition-opacity rounded focus-visible:outline-2 focus-visible:outline-blue-500 ${
                groupActive ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {group.name}
            </button>
            {group.items.map((item) => {
              const isActive = activeCategories.has(item.name);
              return (
                <button
                  key={item.name}
                  onClick={() => onToggleCategory(item.name)}
                  aria-pressed={isActive}
                  className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-1"
                  style={{
                    backgroundColor: isActive ? item.color : "#fff",
                    color: isActive
                      ? (item.textColor ?? "#fff")
                      : "#374151",
                    borderColor: item.color,
                    opacity: isActive ? 1 : 0.75,
                  }}
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        );
      })}

      <span className="mx-1 text-gray-300" aria-hidden="true">|</span>
      <button
        onClick={onClearAll}
        className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer ml-1 rounded focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        Clear all
      </button>
    </div>
  );
}
