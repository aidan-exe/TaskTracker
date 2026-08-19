# TaskTracker Architecture Guide

## ✅ Yes, Everything is Split into Components!

The project follows **React best practices** with a **component-based architecture**. Changes in one place propagate automatically throughout the app.

---

## 📁 Project Structure

```
src/
├── components/           # All reusable UI components
│   ├── AnalyticsView.tsx       # Analytics/metrics dashboard
│   ├── CelebrationAnimation.tsx # Confetti animation
│   ├── CommentForm.tsx         # Comment input form
│   ├── CommentList.tsx         # List of comments
│   ├── CreateModal.tsx         # Modal for creating epics/stories/tasks
│   ├── EpicModal.tsx           # Epic detail modal
│   ├── FilterBar.tsx           # Search & filter controls
│   ├── HierarchyView.tsx       # Tree-style view
│   ├── KanbanColumn.tsx        # Single kanban column
│   ├── KanbanView.tsx          # Board view
│   ├── ListView.tsx            # List view
│   ├── NotificationToast.tsx   # Toast notifications
│   ├── PointsBadge.tsx         # Points display badge
│   ├── PriorityBadge.tsx       # Priority indicator
│   ├── StatusBadge.tsx         # Status indicator
│   ├── StatsBar.tsx            # Summary statistics
│   ├── StoryCard.tsx           # Story card component
│   ├── StoryModal.tsx          # Story detail modal
│   ├── TaskCard.tsx            # Task card component
│   ├── TaskModal.tsx           # Task detail modal
│   ├── ThemeProvider.tsx       # Dark mode provider
│   ├── UserAvatar.tsx          # User avatar component
│   ├── UserManager.tsx         # User management modal
│   ├── VoucherQRCode.tsx       # QR code modal
│   └── VoucherRewards.tsx      # Rewards modal
│
├── store.ts              # Zustand state management (single source of truth)
├── types.ts              # TypeScript interfaces & types
├── constants.ts          # Shared constants
├── index.css             # Global styles & animations
├── App.tsx               # Main app component
└── main.tsx              # React entry point
```

---

## 🎯 Single Source of Truth

### **State Management: Zustand Store**

All app data lives in **one place**: `src/store.ts`

```typescript
// store.ts contains:
- epics: Epic[]           // All epics
- stories: Story[]        // All stories  
- tasks: Task[]           // All tasks
- users: User[]           // All users
- notifications: Notification[]  // All notifications
- filters: FilterState    // Current filters
- view: View              // Current view (kanban/hierarchy/list/analytics)
- darkMode: boolean       // Theme state
```

**Key Benefit**: Change data once, all components update automatically!

---

## 🔄 How Data Flows

### Example: Completing a Task

1. **User Action**: Drag task to "Done" in Kanban view
2. **Store Update**: `moveTask()` function updates task status
3. **Automatic Updates**: All components re-render with new data
   - ✅ Task card shows "Done" status
   - ✅ Stats bar updates completion count
   - ✅ Analytics view recalculates metrics
   - ✅ Points are awarded (if assigned)
   - ✅ Notification appears
   - ✅ Celebration animation plays

**You change it ONCE** → Everything updates automatically!

---

## 🧩 Component Reusability

### Shared Components

Components are designed to be reused across different views:

#### **UserAvatar**
```typescript
// Used in 8+ places:
- User Manager
- Task cards
- Story cards
- Assignee filters
- Comments
- Notifications
- Analytics leaderboard
- VoucherRewards modal
```

**Change once** → Updates everywhere!

#### **StatusBadge** & **PriorityBadge**
```typescript
// Used in all card types:
- Task cards
- Story cards
- Epic cards
- List view rows
- Modal headers
```

**Change once** → Updates everywhere!

#### **PointsBadge**
```typescript
// Used in:
- App header
- VoucherRewards modal
- Analytics view (potentially)
```

**Change once** → Updates everywhere!

---

## 📝 Example: Adding a New Field

### Scenario: Add "Difficulty" field to Tasks

**Step 1**: Update types (ONE place)
```typescript
// types.ts
export interface Task {
  // ... existing fields
  difficulty: 'easy' | 'medium' | 'hard'
}
```

**Step 2**: Update store initialization (ONE place)
```typescript
// store.ts - in addTask action
addTask: (task) => {
  set((s) => ({
    tasks: [...s.tasks, { 
      ...task, 
      difficulty: task.difficulty || 'medium',  // ← Add here
      // ...
    }]
  }))
}
```

**Step 3**: Update UI components (where you want it shown)
```typescript
// TaskCard.tsx - display it
<span>Difficulty: {task.difficulty}</span>

// CreateModal.tsx - add input field
<select value={difficulty} onChange={...}>
  <option value="easy">Easy</option>
  <option value="medium">Medium</option>
  <option value="hard">Hard</option>
</select>
```

**That's it!** The data flows automatically everywhere.

---

## 🎨 Styling Architecture

### Tailwind CSS Classes

Styles are **inline with components** using Tailwind utility classes:

```typescript
<div className="rounded-lg bg-white dark:bg-slate-800 p-4">
  Content
</div>
```

**Benefits**:
- No separate CSS files to manage
- Dark mode built-in (`dark:` prefix)
- Easy to see what styles apply
- Component styles stay together

### Global Styles

Only **custom animations** and **base styles** are in `index.css`:
```css
@layer utilities {
  .animate-confetti-fall { ... }
  .animate-slide-in-right { ... }
  .line-clamp-2 { ... }
}
```

---

## 🔧 Common Patterns

### 1. **Reading from Store**
```typescript
const tasks = useTaskStore((s) => s.tasks)
const users = useTaskStore((s) => s.users)
```

### 2. **Updating Store**
```typescript
const { addTask, updateTask, deleteTask } = useTaskStore()

// Then use anywhere:
addTask(newTask)
updateTask(id, { title: 'New title' })
deleteTask(id)
```

### 3. **Computed Data**
```typescript
// Store has helper functions:
const { getUserById, getTaskById, filteredTasks } = useTaskStore()

const user = getUserById('user-id')
const tasks = filteredTasks() // Applies current filters
```

---

## 🚀 Adding New Features

### Template: Adding a "Tags" Feature

**1. Update Types** (types.ts)
```typescript
export interface Task {
  // ... existing
  tags: string[]
}
```

**2. Update Store** (store.ts)
```typescript
addTask: (task) => ({
  ...task,
  tags: task.tags || [],  // ← Initialize
})
```

**3. Create TagBadge Component** (components/TagBadge.tsx)
```typescript
export function TagBadge({ tag }: { tag: string }) {
  return (
    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
      {tag}
    </span>
  )
}
```

**4. Use in Cards** (TaskCard.tsx)
```typescript
{task.tags.map(tag => (
  <TagBadge key={tag} tag={tag} />
))}
```

**Done!** Tags appear everywhere tasks are displayed.

---

## 🎯 Key Principles

### ✅ DRY (Don't Repeat Yourself)
- Components are reused, not duplicated
- Shared logic lives in the store
- Types ensure consistency

### ✅ Single Responsibility
- Each component does ONE thing well
- `TaskCard` displays a task
- `TaskModal` edits a task
- Store manages state

### ✅ Composition Over Duplication
- Build complex UIs from simple components
- `StoryCard` uses `TaskCard`, `StatusBadge`, `PriorityBadge`, `UserAvatar`
- Change `UserAvatar` → Updates everywhere

### ✅ Type Safety
- TypeScript prevents bugs
- Change a type → Compiler shows ALL places to update
- No guessing where data is used

---

## 🐛 Debugging Tips

### Finding Where Something is Used

**VS Code Search** (Cmd/Ctrl + Shift + F):
```
Search: "UserAvatar"
→ Shows all files using that component

Search: "moveTask"
→ Shows where task status changes happen
```

### Tracing Data Flow

1. **Find the action**: Look in `store.ts`
2. **Find the component**: Look in `components/`
3. **See TypeScript errors**: They guide you!

---

## 📊 Summary

| Concern | Location | Change Once? |
|---------|----------|--------------|
| Data structure | `types.ts` | ✅ |
| Data storage | `store.ts` | ✅ |
| UI components | `components/` | ✅ |
| Shared constants | `constants.ts` | ✅ |
| Theme colors | `tailwind.config.js` | ✅ |
| Global animations | `index.css` | ✅ |

---

## 🎓 Conclusion

**Yes, the project is well-organized!**

✅ **Change once** → Updates everywhere  
✅ **Add feature once** → Works everywhere  
✅ **Fix bug once** → Fixed everywhere  
✅ **TypeScript ensures** → Nothing breaks  

The component architecture means you **never** have to hunt through files making the same change in multiple places. That's the power of React + proper architecture!
