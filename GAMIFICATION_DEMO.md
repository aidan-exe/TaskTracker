# Gamification Demo Guide

## 🎮 How to Test the Gamification Features

The app now includes **dummy data** so you can immediately test the points and voucher system!

### Quick Start

1. **Run the app**: `npm run dev`
2. The app opens in **Kanban view** by default
3. You're viewing as **Alex Chen** (the first user)

---

## 🪙 Earning Points

### Test #1: Complete a Task (Earn 10 Points)

**Current Status**: Alex has **80 points**

1. Find the task: **"Award points on task completion - Move this to DONE to earn 10 points!"**
2. Drag it from **"In Progress"** column to **"Done"** column
3. Watch what happens:
   - ✨ Celebration animation with confetti!
   - 🔔 Toast notification: "+10 points: Completed task: Award points on task completion"
   - 🪙 Points badge in header updates: **80 → 90 points**

### Test #2: Complete a Story (Earn 50 Points)

1. Find the story: **"Points system for task completion - Move this to DONE to earn 50 points!"**
2. Drag it from **"In Progress"** to **"Done"**
3. Watch what happens:
   - ✨ Celebration animation!
   - 🔔 Toast notification: "+50 points: Completed story: Points system for task completion"
   - 🪙 Points badge updates: **90 → 140 points**

---

## ☕ Redeeming Vouchers

### Test #3: Buy a Coffee Voucher

**After completing both tasks above, you'll have 140 points**

1. Click the **Gift icon** (🎁) in the header
2. The **Reward Store** modal opens showing:
   - Your current points: **140 pts**
   - Coffee option: **100 pts**
   - Cappuccino option: **150 pts** (not enough yet!)
3. Click **"Redeem"** on the Coffee voucher
4. Watch what happens:
   - Button changes to "Redeemed!"
   - Points deduct: **140 → 40 points**
   - New voucher appears in "Your Vouchers" section
   - Shows expiry date (30 days from now)
   - 🔔 Toast notification: "Redeemed coffee voucher!"

### Test #4: Show QR Code for Redemption

1. In the "Your Vouchers" section, find your newly redeemed coffee voucher
2. Click the **"Show QR Code"** button
3. A modal opens showing:
   - 📱 QR code that can be scanned
   - 🆔 Unique voucher code (e.g., `VOUCHER-COFFEE-12ab34cd`)
   - ☕ Voucher type (Coffee or Cappuccino)
   - 📅 Redemption and expiry dates
   - 👤 User name
4. Options:
   - **Scan the QR code** - Show it at the counter to redeem
   - **Download** - Save the QR code as a PNG image
   - The QR code contains all voucher details in JSON format

### Test #5: Try to Buy Cappuccino (Not Enough Points)

1. With only 40 points left, the **Cappuccino** button is disabled
2. Complete more tasks/stories to earn 110 more points!

---

## 🔔 Notifications

All notifications appear in the **bottom-right corner** and include:

- **Status Changes**: When any task/story moves between columns
  - Shows old status → new status
  - Shows who made the change
  - Icon: 📈 TrendingUp

- **Points Awarded**: When you complete work
  - Shows how many points earned
  - Icon: 🏆 Trophy

- **Vouchers Redeemed**: When you redeem rewards
  - Icon: 🎁 Gift

Notifications **auto-dismiss after 5 seconds** or you can click the ✕ to dismiss manually.

---

## 👥 Dummy Users

The app includes 3 test users:

1. **Alex Chen** (You)
   - Email: alex@tasktracker.dev
   - Starting points: 80
   - Assigned to: Password reset flow, Points system story

2. **Sam Rivera**
   - Email: sam@tasktracker.dev
   - Points: 120
   - Already has 1 coffee voucher

3. **Jordan Lee**
   - Email: jordan@tasktracker.dev
   - Points: 45

---

## 🎯 Key Features

✅ **Points are only awarded once** - Moving from "done" back to "in progress" and then to "done" again won't re-award points  
✅ **Only assignees earn points** - Unassigned tasks don't award points  
✅ **Vouchers expire in 30 days** - Use them before they expire!  
✅ **QR codes for redemption** - Each voucher has a unique QR code that can be scanned or downloaded  
✅ **Real-time notifications** - See all status changes and point awards  
✅ **Dark mode support** - Toggle with moon/sun icon in header  
✅ **Persistent data** - Points and vouchers save in local storage  

---

## 🔄 Reset Data

If you want to start fresh:
1. Open browser DevTools (F12)
2. Go to **Application** → **Local Storage**
3. Delete the `tasktracker-store-v2` key
4. Refresh the page

The dummy data will reload with Alex at 80 points again!

---

## 🎨 View Options

Switch between views using the view toggle in the filter bar:
- **Kanban** 📋 - Drag and drop cards (best for testing)
- **Hierarchy** 🌳 - Tree structure
- **List** 📝 - Simple list view

---

Have fun testing! 🎉
