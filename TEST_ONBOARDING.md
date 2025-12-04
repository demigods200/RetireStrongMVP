# Testing Onboarding (Step 3.1)

## How to Test Onboarding

### Option 1: From Home Page (When Logged In)

1. **Make sure you're logged in:**
   ```javascript
   // In browser console (F12)
   localStorage.setItem('accessToken', 'test-token-123');
   ```

2. **Visit `http://localhost:3000`**
   - You should see the welcome dashboard

3. **Click "Complete Onboarding"** in the Quick Actions section
   - This will take you to `/onboarding`

### Option 2: From Account Page

1. **Make sure you're logged in:**
   ```javascript
   localStorage.setItem('accessToken', 'test-token-123');
   ```

2. **Visit `http://localhost:3000/account`**

3. **Click "Complete Onboarding" button**
   - This will take you to `/onboarding`

### Option 3: Direct URL

1. **Make sure you're logged in:**
   ```javascript
   localStorage.setItem('accessToken', 'test-token-123');
   ```

2. **Visit `http://localhost:3000/onboarding` directly**
   - The page will automatically create a test userId if one doesn't exist

## Testing the Onboarding Wizard

### Step 1: Demographics
- ✅ Enter age (50-100)
- ✅ Select gender
- ✅ Enter location (optional)
- ✅ Click "Next"

### Step 2: Health & Activity
- ✅ Select activity level (radio buttons)
- ✅ Enter health conditions (optional, comma-separated)
- ✅ Click "Next"

### Step 3: Goals
- ✅ Select one or more goals (checkboxes)
- ✅ Click "Next"

### Step 4: Schedule
- ✅ Select preferred days (at least one)
- ✅ Select preferred time
- ✅ Enter session duration (10-60 minutes)
- ✅ Click "Complete"

## Expected Behavior

1. **Progress Indicator:**
   - Shows 4 steps
   - Current step is highlighted in blue
   - Completed steps are highlighted

2. **Navigation:**
   - "Previous" button (disabled on step 1)
   - "Next" button (changes to "Complete" on last step)

3. **After Completion:**
   - Redirects to `/today?onboarding=complete`
   - Shows welcome message on Today page

## Testing Without AWS

**Note:** The actual API call will fail without AWS setup, but you can test:
- ✅ UI/UX of the wizard
- ✅ Form validation
- ✅ Navigation between steps
- ✅ Progress indicator
- ✅ Form state management

**To test the full flow (with API):**
- You'll need AWS Cognito and DynamoDB set up
- Or use LocalStack for local testing

## Quick Test Commands

```javascript
// Set up test authentication
localStorage.setItem('accessToken', 'test-token-123');

// Set a test userId (or let onboarding page create one)
localStorage.setItem('userId', 'test-user-123');

// Clear and start fresh
localStorage.clear();
```

## Troubleshooting

**Can't access `/onboarding`:**
- Make sure you're logged in (check `localStorage.getItem('accessToken')`)
- The page will create a test userId automatically if needed

**Form not submitting:**
- Check browser console for errors
- API call will fail without AWS setup (expected)
- UI should still work for testing

**Buttons not working:**
- Check that you're on the correct step
- Make sure required fields are filled

---

**Ready to test!** Start with Option 1 or 2 above.

