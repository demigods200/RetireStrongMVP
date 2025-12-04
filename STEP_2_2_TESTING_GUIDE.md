# Step 2.2 Testing Guide: Authentication Flow

## 🎯 What to Test

This guide will help you verify that the authentication system works correctly. Test both authenticated and unauthenticated states.

---

## ✅ Test 1: Home Page Authentication Check

### **Scenario A: Not Authenticated**
1. **Clear your browser's localStorage** (or use incognito/private window):
   - Open browser console (F12)
   - Run: `localStorage.clear()`
   - Or use incognito mode

2. **Visit `http://localhost:3000`**
   - ✅ Should see landing page with:
     - "Welcome to Retire Strong" heading
     - "Get Started" button
     - "Sign In" button
     - App description and features
   - ✅ Should NOT redirect automatically

### **Scenario B: Authenticated**
1. **Login first** (see Test 2 below)
2. **Visit `http://localhost:3000`**
   - ✅ Should automatically redirect to `/today`
   - ✅ Should NOT show landing page

---

## ✅ Test 2: Sign Up Flow

### **Test Signup Page**
1. **Visit `http://localhost:3000/signup`**
   - ✅ Page loads without errors
   - ✅ Form fields are visible:
     - First Name
     - Last Name
     - Email
     - Password
   - ✅ "Create Account" button is visible
   - ✅ "Sign in here" link is visible

### **Test Form Validation**
1. **Try submitting empty form**
   - ✅ Should show validation errors
   - ✅ Required fields are marked

2. **Try invalid email** (e.g., "notanemail")
   - ✅ Should show email validation error

3. **Try short password** (less than 8 characters)
   - ✅ Should show password length error

### **Test Successful Signup** (if AWS is configured)
1. **Fill in valid information:**
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "test@example.com"
   - Password: "password123" (8+ characters)

2. **Click "Create Account"**
   - ✅ If AWS Cognito is set up: Should create account and redirect to `/login?signup=success`
   - ✅ If AWS is NOT set up: Will show error (expected - need to deploy infrastructure first)

---

## ✅ Test 3: Login Flow

### **Test Login Page**
1. **Visit `http://localhost:3000/login`**
   - ✅ Page loads without errors
   - ✅ Form fields are visible:
     - Email
     - Password
   - ✅ "Sign In" button is visible
   - ✅ "Create one here" link is visible

### **Test Login with Success Message**
1. **Visit `http://localhost:3000/login?signup=success`**
   - ✅ Should show green success message: "Account created successfully! Please sign in."

### **Test Form Validation**
1. **Try submitting empty form**
   - ✅ Should show validation errors

2. **Try invalid credentials**
   - ✅ Should show error message (if AWS is configured)

### **Test Successful Login** (if AWS is configured)
1. **Enter valid credentials**
2. **Click "Sign In"**
   - ✅ If AWS Cognito is set up: Should login and redirect to `/today`
   - ✅ Token should be stored in localStorage (check with `localStorage.getItem('accessToken')`)
   - ✅ If AWS is NOT set up: Will show error (expected)

---

## ✅ Test 4: Auth Guards (Protected Pages)

### **Test: Access Protected Pages Without Login**
1. **Clear localStorage** (or use incognito): `localStorage.clear()`
2. **Try accessing these pages directly:**
   - `http://localhost:3000/today` → ✅ Should redirect to `/login`
   - `http://localhost:3000/plan` → ✅ Should redirect to `/login`
   - `http://localhost:3000/progress` → ✅ Should redirect to `/login`
   - `http://localhost:3000/coach` → ✅ Should redirect to `/login`
   - `http://localhost:3000/library` → ✅ Should redirect to `/login`
   - `http://localhost:3000/settings` → ✅ Should redirect to `/login`
   - `http://localhost:3000/account` → ✅ Should redirect to `/login`

### **Test: Access Protected Pages With Login**
1. **Login first** (manually set token for testing):
   ```javascript
   localStorage.setItem('accessToken', 'test-token-123');
   ```
2. **Try accessing the same pages:**
   - ✅ Should load the page (not redirect)
   - ✅ Content should be visible

---

## ✅ Test 5: Guest Guards (Auth Pages)

### **Test: Access Login/Signup When Already Logged In**
1. **Set authentication token:**
   ```javascript
   localStorage.setItem('accessToken', 'test-token-123');
   ```
2. **Try accessing:**
   - `http://localhost:3000/login` → ✅ Should redirect to `/today`
   - `http://localhost:3000/signup` → ✅ Should redirect to `/today`

### **Test: Access Login/Signup When NOT Logged In**
1. **Clear localStorage:** `localStorage.clear()`
2. **Try accessing:**
   - `http://localhost:3000/login` → ✅ Should show login page (no redirect)
   - `http://localhost:3000/signup` → ✅ Should show signup page (no redirect)

---

## ✅ Test 6: Account Page

### **Test: Access Account Page Without Login**
1. **Clear localStorage:** `localStorage.clear()`
2. **Visit `http://localhost:3000/account`**
   - ✅ Should redirect to `/login`

### **Test: Access Account Page With Login**
1. **Set token:** `localStorage.setItem('accessToken', 'test-token-123');`
2. **Visit `http://localhost:3000/account`**
   - ✅ Should show account page
   - ✅ Should display placeholder user info
   - ✅ "Sign Out" button is visible

### **Test: Sign Out**
1. **On account page, click "Sign Out"**
   - ✅ Should clear tokens from localStorage
   - ✅ Should redirect to `/login`
   - ✅ Verify: `localStorage.getItem('accessToken')` should be `null`

---

## ✅ Test 7: Navigation

### **Test Navbar Links**
1. **When NOT logged in:**
   - ✅ Navbar links should still be visible
   - ✅ Clicking any link redirects to `/login`

2. **When logged in:**
   - ✅ All navbar links work
   - ✅ Active page is highlighted in navbar
   - ✅ Can navigate between pages

### **Test Mobile Menu** (if testing on small screen)
1. **Resize browser to mobile size**
2. **Click hamburger menu**
   - ✅ Menu opens
   - ✅ Links are clickable
   - ✅ Menu closes when link is clicked

---

## ✅ Test 8: UI/UX (50+ Friendly Design)

### **Check Form Accessibility**
1. **Visit `/signup` and `/login`**
   - ✅ Input fields are large (minimum 18px font)
   - ✅ Labels are clear and visible
   - ✅ Touch targets are at least 44x44px
   - ✅ High contrast colors
   - ✅ Error messages are clear and visible

### **Check Page Layout**
1. **Visit any page**
   - ✅ Text is readable (18px+ base font)
   - ✅ Buttons are large enough
   - ✅ Spacing is comfortable
   - ✅ Colors have good contrast

---

## ✅ Test 9: Error Handling

### **Test API Errors** (if AWS is configured)
1. **Try signup with existing email**
   - ✅ Should show appropriate error message

2. **Try login with wrong password**
   - ✅ Should show "Invalid email or password" error

3. **Try login with non-existent email**
   - ✅ Should show appropriate error message

### **Test Network Errors**
1. **Disconnect internet** (or stop API server)
2. **Try to signup/login**
   - ✅ Should show error message
   - ✅ Should not crash the app

---

## ✅ Test 10: Token Persistence

### **Test: Refresh Page**
1. **Login** (set token manually or via real login)
2. **Refresh the page** (F5)
   - ✅ Should stay on the same page (not redirect to login)
   - ✅ Token should persist

### **Test: Close and Reopen Browser**
1. **Login and set token**
2. **Close browser tab**
3. **Reopen and visit `/today`**
   - ✅ If token is still in localStorage: Should access page
   - ✅ If token is cleared: Should redirect to login

---

## 🚨 Known Limitations (Expected Behavior)

### **AWS Resources Not Deployed**
- ❌ Signup/Login will fail with API errors (expected)
- ✅ UI and routing still work correctly
- ✅ Auth guards still work (checking localStorage)

### **Token Validation**
- ⚠️ Currently only checks if token exists (doesn't validate token)
- ⚠️ Will be improved in production with JWT validation

---

## 📋 Quick Test Checklist

### **Must Test (Core Functionality)**
- [ ] Home page redirects when authenticated
- [ ] Home page shows landing page when not authenticated
- [ ] Protected pages redirect to login when not authenticated
- [ ] Login/Signup pages redirect to dashboard when authenticated
- [ ] Account page shows and sign out works
- [ ] Navigation works correctly

### **Should Test (Important)**
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] UI is 50+ friendly (large text, good contrast)
- [ ] Mobile menu works (if applicable)

### **Nice to Test (If AWS is Set Up)**
- [ ] Real signup flow works
- [ ] Real login flow works
- [ ] API errors are handled gracefully

---

## 🎯 Success Criteria

✅ **Step 2.2 is working correctly if:**
1. Home page checks auth and redirects appropriately
2. All protected pages require authentication
3. Auth pages redirect when already logged in
4. Sign out clears tokens and redirects
5. Navigation works in both authenticated and unauthenticated states
6. Forms are accessible and 50+ friendly

---

## 🔧 Quick Test Commands

```bash
# Clear localStorage in browser console
localStorage.clear()

# Set test token (for testing protected pages)
localStorage.setItem('accessToken', 'test-token-123')

# Check if token exists
localStorage.getItem('accessToken')

# Remove token
localStorage.removeItem('accessToken')
```

---

**Ready to test!** Start with Test 1 and work through the list. Focus on the "Must Test" items first.

