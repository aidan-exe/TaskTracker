# Gamification Demo Guide

## 🎮 Gamification Features

TaskTracker includes a complete gamification system with points, vouchers, and real-time notifications!

---

## 🪙 How Points Work

### Earning Points

Users earn points automatically when they complete work:

- **10 points** - Completing a task
- **50 points** - Completing a story
- **200 points** - Completing an epic (future feature)

### Key Features

- ✅ Points only awarded when status changes TO 'done'
- ✅ Points only awarded to assignees
- ✅ No point farming - moving back and forth doesn't re-award points
- ✅ Real-time notifications when points are earned
- ✅ Points displayed in header badge

---

## ☕ Voucher System

### Redeeming Vouchers

Users can spend their points on rewards:

- **Coffee** - 100 points
- **Cappuccino** - 150 points

### Voucher Features

- ✅ 30-day expiry on all vouchers
- ✅ QR codes for redemption
- ✅ Download QR codes as PNG
- ✅ Track active and expired vouchers
- ✅ Unique voucher codes

### Using Vouchers

1. Click the **Gift icon** (🎁) in header
2. View your current points
3. Click "Redeem" on coffee or cappuccino
4. Click "Show QR Code" on redeemed voucher
5. Show QR code at counter or download it

---

## 🔔 Notifications

All actions trigger real-time toast notifications:

### Notification Types

**Status Changes** 📈
- Shows when any task/story moves between columns
- Displays old status → new status
- Shows who made the change
- Icon: TrendingUp

**Points Awarded** 🏆
- Shows when you complete work
- Displays points earned and reason
- Icon: Trophy

**Vouchers Redeemed** 🎁
- Confirms voucher redemption
- Icon: Gift

### Notification Behavior

- Auto-dismiss after 5 seconds
- Manual dismiss with ✕ button
- Max 3 notifications shown at once
- Stack in bottom-right corner

---

## 📱 QR Code Redemption

Each voucher has a unique QR code containing:

```json
{
  "code": "VOUCHER-COFFEE-12ab34cd",
  "type": "coffee",
  "user": "User Name",
  "redeemed": "2024-02-09T10:30:00Z",
  "expires": "2024-03-10T10:30:00Z"
}
```

**Features:**
- Scannable by any QR reader
- Download as PNG image
- Shows voucher details
- Displays expiry date
- Includes user name

---

## 🎨 UI Components

### PointsBadge
Shows current points with coin icon
- Used in app header
- Used in rewards modal
- Supports 3 sizes (sm/md/lg)
- Dark mode compatible

### VoucherRewards Modal
Full rewards interface:
- Current points display
- Voucher redemption options
- Active vouchers list
- Expired vouchers section
- Empty state when no vouchers

### NotificationToast
Toast-style notifications:
- Color-coded by type
- Auto-dismiss timer
- Click to dismiss
- Smooth animations

### CelebrationAnimation
Confetti effect on completion:
- 30 animated particles
- Multiple colors
- Center burst effect
- 2-second duration

---

## 🎯 Testing the Features

### Create Some Data

1. Add team members (Team button → Add Member)
2. Create an epic (New button → Epic)
3. Add stories to the epic
4. Add tasks to stories
5. Assign tasks to users

### Test Points System

1. Drag a task to "Done" column
2. Watch celebration animation 🎉
3. See notification toast "+10 points"
4. Check points badge updates in header

### Test Voucher System

1. Complete enough tasks/stories to earn 100+ points
2. Click Gift icon in header
3. Redeem a coffee voucher
4. See voucher appear in "Your Vouchers"
5. Click "Show QR Code"
6. Download QR code or scan it

### Test Real-time Updates

1. Move tasks between columns
2. See notifications for status changes
3. Complete tasks assigned to you
4. See points update instantly

---

## 🔄 Data Persistence

All gamification data is persisted:

**LocalStorage** (offline mode):
- Points per user
- Voucher history
- Notification history
- User preferences

**Supabase** (when connected):
- Synced across devices
- Real-time updates
- Multi-user collaboration
- Secure data storage

---

## 🌙 Dark Mode

All gamification components support dark mode:

- Points badge (amber theme)
- Voucher rewards modal
- QR code display
- Notification toasts
- Celebration animation

Toggle with moon/sun icon in header!

---

## 🏆 Leaderboard

Check the **Analytics view** to see:

- Team rankings by points
- Completion rates per user
- Task/story counts
- Performance metrics

---

## 🎮 Gamification Flow

```
User completes task
    ↓
Status changes to "done"
    ↓
Points awarded to assignee
    ↓
Celebration animation plays
    ↓
Notification toast appears
    ↓
Points badge updates
    ↓
User can redeem vouchers
    ↓
QR code generated
    ↓
Voucher redeemed at counter
```

---

## 💡 Tips

- **Earn points fast**: Focus on completing smaller tasks
- **Save points**: Wait until you have 150 for cappuccino
- **Check expiry**: Use vouchers before 30-day expiry
- **Download QR codes**: Save them for offline redemption
- **Check analytics**: See your ranking on leaderboard

---

Enjoy the gamification features! 🎉
