# Onboarding Flow Testing Checklist

## 🎯 Overview
Test the complete onboarding wizard flow with 4 steps: Demographics, Health & Activity, Goals, and Schedule.

---

## ✅ Step 1: Demographics - "About You"

### Age Field
- [ ] **Input Validation**
  - Enter age between 50-100 → Should accept
  - Enter age below 50 (e.g., 45) → Should not allow or show error
  - Enter age above 100 (e.g., 105) → Should not allow or show error
  - Leave age empty → "Next" button should be disabled
  - Enter non-numeric value → Should handle gracefully

- [ ] **UI/UX**
  - Input field has proper focus state (blue ring)
  - Placeholder text is visible
  - Helper text "Must be between 50 and 100" is displayed
  - Input styling matches design (border-2, rounded-lg, text-lg)

### Gender Dropdown
- [ ] **Dropdown Functionality**
  - Click dropdown → Options appear (Male, Female, Other, Prefer not to say)
  - Select each option → Value updates correctly
  - Default value is "Prefer not to say"
  - Selected value persists when navigating back

- [ ] **UI/UX**
  - Dropdown styling matches other inputs
  - Focus state works properly
  - Dropdown arrow is visible
  - Selected value displays correctly

### Location Field (Optional)
- [ ] **Input Functionality**
  - Enter location text → Value saves correctly
  - Leave empty → Should be allowed (optional field)
  - Enter long text → Handles properly
  - Special characters → Handles properly

- [ ] **UI/UX**
  - "(Optional)" label is visible
  - Input styling consistent with other fields

### Navigation
- [ ] **Button States**
  - Without valid age/gender → "Next" button is disabled
  - With valid age/gender → "Next" button is enabled
  - "Previous" button is disabled on Step 1

---

## ✅ Step 2: Health & Activity - "Health today"

### Activity Level Selection
- [ ] **Selection Functionality**
  - Click each option (Sedentary, Light, Moderate, Active) → Only one can be selected
  - Selected option shows blue border and left blue line
  - Unselected options show gray border
  - Hover effect works on unselected options
  - Selection persists when navigating back

- [ ] **UI/UX**
  - Cards are full-width and properly spaced
  - Left blue line indicator appears on selected card
  - Text is readable (label bold, description smaller)
  - No checkbox/radio button visible (clean design)
  - Cards have proper padding and spacing

### Health Conditions (Optional)
- [ ] **Input Functionality**
  - Enter single condition → Saves correctly
  - Enter multiple conditions separated by commas → Parses correctly
  - Leave empty → Should be allowed (optional)
  - Test with various formats: "Arthritis, High blood pressure, Diabetes"
  - Extra spaces around commas → Handles correctly

- [ ] **UI/UX**
  - Placeholder text is helpful
  - Helper text "Separate multiple conditions with commas" is visible
  - Input styling consistent

### Navigation
- [ ] **Button States**
  - Without activity level selected → "Next" button is disabled
  - With activity level selected → "Next" button is enabled
  - "Previous" button works and returns to Step 1

---

## ✅ Step 3: Goals - "Focus areas"

### Goal Selection (Multi-select)
- [ ] **Selection Functionality**
  - Click multiple goals → All selected goals show blue border and left line
  - Click selected goal again → Deselects correctly
  - Select all 8 goals → All show selected state
  - Selection persists when navigating back
  - Grid layout works (1 column on mobile, 2 columns on desktop)

- [ ] **Available Goals**
  - [ ] Improve strength
  - [ ] Increase flexibility
  - [ ] Better balance
  - [ ] Reduce pain
  - [ ] Maintain independence
  - [ ] Travel readiness
  - [ ] Energy and vitality
  - [ ] Weight management

- [ ] **UI/UX**
  - Cards are properly sized in grid
  - Selected cards show blue border and left blue line
  - Unselected cards show gray border
  - Hover effect works
  - Text is readable and properly aligned
  - No checkbox visible (clean design)

### Validation Message
- [ ] **Warning Display**
  - No goals selected → Amber warning box appears
  - Warning message: "Please select at least one goal to continue"
  - Warning disappears when at least one goal is selected

### Navigation
- [ ] **Button States**
  - Without any goals selected → "Next" button is disabled
  - With at least one goal selected → "Next" button is enabled
  - "Previous" button works and returns to Step 2

---

## ✅ Step 4: Schedule - "Weekly rhythm"

### Preferred Days Selection
- [ ] **Day Selection (Multi-select)**
  - Click day buttons (Mon-Sun) → Toggle selection correctly
  - Selected days show blue background with white text
  - Unselected days show gray border
  - Select multiple days → All show selected state
  - Grid of 7 days displays correctly
  - Selection persists when navigating back

- [ ] **UI/UX**
  - Day buttons are properly sized and spaced
  - Selected state is clear (blue bg, white text)
  - Hover effect works on unselected days
  - Text is readable (Mon, Tue, Wed, etc.)

### Validation Message
- [ ] **Warning Display**
  - No days selected → Amber warning appears
  - Warning message: "Please select at least one day"
  - Warning disappears when at least one day is selected

### Preferred Time Dropdown
- [ ] **Dropdown Functionality**
  - Options: Morning, Afternoon, Evening, Flexible
  - Select each option → Value updates correctly
  - Default is "Flexible"
  - Selection persists when navigating back

- [ ] **UI/UX**
  - Dropdown styling consistent with other selects
  - Focus state works

### Session Duration
- [ ] **Input Functionality**
  - Enter number between 10-60 → Accepts
  - Enter number below 10 → Should not allow or show error
  - Enter number above 60 → Should not allow or show error
  - Step of 5 works (10, 15, 20, etc.)
  - "minutes" label is visible on the right
  - Default value is 30
  - Value persists when navigating back

- [ ] **UI/UX**
  - Input field has proper styling
  - "minutes" label is positioned correctly
  - Focus state works

### Navigation
- [ ] **Button States**
  - Without days selected or invalid duration → "Next" button is disabled
  - With valid data → "Next" button shows "Complete"
  - "Previous" button works and returns to Step 3

---

## ✅ Progress Indicator

- [ ] **Progress Bar**
  - Progress bar updates smoothly when moving between steps
  - Shows correct percentage (25%, 50%, 75%, 100%)
  - Blue fill animates smoothly
  - Step counter shows "Step X of 4" correctly

- [ ] **Visual Feedback**
  - Progress bar is visible at the top
  - Percentage display is accurate

---

## ✅ Navigation Flow

### Forward Navigation
- [ ] **Step Progression**
  - Step 1 → Step 2 → Step 3 → Step 4 works correctly
  - "Next" button only works when validation passes
  - Step transitions are smooth
  - Form data persists across steps

### Backward Navigation
- [ ] **Step Regression**
  - Step 4 → Step 3 → Step 2 → Step 1 works correctly
  - "Previous" button is disabled on Step 1
  - Previously entered data is preserved
  - Selections remain intact

### Final Submission
- [ ] **Completion Flow**
  - On Step 4, "Next" button shows "Complete"
  - Click "Complete" → Shows loading state ("Saving...")
  - Successful submission → Redirects to `/today?onboarding=complete`
  - Failed submission → Shows error alert
  - Loading state disables buttons

---

## ✅ Data Persistence

- [ ] **Form Data Retention**
  - Navigate forward and back → All data remains
  - Refresh page → Data may be lost (expected for now)
  - Submit form → Data is sent to API correctly

---

## ✅ API Integration

- [ ] **API Call**
  - Submit form → POST request sent to `/api/users/onboarding`
  - Request body contains `userId` and `onboardingData`
  - Response handling works correctly
  - Success response → Redirects to today page
  - Error response → Shows error message

- [ ] **Error Handling**
  - Network error → Shows "An error occurred" alert
  - API error → Shows error message from API
  - Loading state works during API call

---

## ✅ Responsive Design

- [ ] **Mobile View (< 640px)**
  - Layout adapts correctly
  - Text is readable
  - Buttons are touch-friendly
  - Grid layouts stack properly (goals: 1 column, days: 7 columns)
  - Spacing is appropriate

- [ ] **Tablet View (640px - 1024px)**
  - Layout works well
  - Goals grid shows 2 columns
  - All elements are accessible

- [ ] **Desktop View (> 1024px)**
  - Full layout displays correctly
  - Maximum width is respected
  - Spacing is optimal

---

## ✅ UI/UX Polish

- [ ] **Visual Consistency**
  - All inputs have consistent styling
  - Border colors match (gray-300 unselected, primary selected)
  - Focus states work on all interactive elements
  - Hover effects work on buttons and cards
  - Left border indicator appears on selected items

- [ ] **Spacing & Layout**
  - Generous spacing between sections (space-y-8)
  - Proper padding in cards (px-5 py-4)
  - Consistent gap spacing (gap-3)
  - Text hierarchy is clear

- [ ] **Typography**
  - Headings are bold and readable
  - Labels are semibold
  - Descriptions are smaller and gray
  - Text sizes are appropriate for 50+ users

---

## ✅ Accessibility

- [ ] **Keyboard Navigation**
  - Tab through all fields → Works correctly
  - Enter/Space on buttons → Activates correctly
  - Focus indicators are visible

- [ ] **Screen Reader**
  - Labels are properly associated with inputs
  - Required fields are marked with asterisk
  - Button states are clear

- [ ] **Color Contrast**
  - Text is readable on backgrounds
  - Selected states are clear
  - Error/warning messages are visible

---

## ✅ Edge Cases

- [ ] **Rapid Clicking**
  - Click "Next" rapidly → Handles gracefully
  - Click selection buttons rapidly → Works correctly

- [ ] **Browser Back/Forward**
  - Use browser back button → May lose state (expected)
  - Use browser forward button → May lose state (expected)

- [ ] **Form Reset**
  - Navigate back and change values → Updates correctly
  - Clear selections → Validation works

---

## 🎯 Quick Test Scenario

**Happy Path:**
1. Navigate to `/onboarding`
2. Enter age: 65
3. Select gender: "Male"
4. Enter location: "New York, NY"
5. Click "Next"
6. Select activity level: "Light"
7. Enter health conditions: "Arthritis, High blood pressure"
8. Click "Next"
9. Select goals: "Improve strength", "Better balance", "Maintain independence"
10. Click "Next"
11. Select days: Monday, Wednesday, Friday
12. Select time: "Morning"
13. Enter duration: 30
14. Click "Complete"
15. Verify redirect to `/today?onboarding=complete`

---

## 📝 Notes

- All form data should be validated before allowing progression
- UI should be clean and elegant with proper spacing
- Selected states should be visually clear
- Error handling should be user-friendly
- Loading states should prevent double submissions

