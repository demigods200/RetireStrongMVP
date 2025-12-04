# Step 3.2 Testing Checklist: Motivation Quiz and Coach Persona

## 🎯 Overview
Test the complete motivation quiz flow, persona assignment, and persona display.

---

## ✅ Quiz Flow (`/motivation/quiz`)

### Page Access
- [ ] Navigate to `/motivation/quiz` → Page loads correctly
- [ ] If not authenticated → Redirects to `/login`
- [ ] Page shows "Motivation Quiz" header
- [ ] Progress bar is visible at 0% initially

### Question Display
- [ ] First question displays correctly
- [ ] Question text is readable and clear
- [ ] All answer options are visible
- [ ] Answer options are properly formatted (buttons with labels)
- [ ] Question counter shows "Question 1 of 12"

### Answer Selection
- [ ] Click an answer option → Option is highlighted (blue border + left line)
- [ ] Selected answer shows visual feedback
- [ ] Only one answer can be selected per question
- [ ] Clicking another answer → Previous selection is cleared
- [ ] Selected answer persists when navigating

### Navigation
- [ ] "Previous" button is disabled on first question
- [ ] "Next" button is disabled until an answer is selected
- [ ] Select answer → "Next" button becomes enabled
- [ ] Click "Next" → Moves to next question
- [ ] Progress bar updates correctly (8.33%, 16.67%, etc.)
- [ ] Question counter updates correctly
- [ ] Click "Previous" → Returns to previous question
- [ ] Previous answer is still selected when going back

### Progress Tracking
- [ ] Progress bar fills smoothly as questions are answered
- [ ] Percentage display is accurate
- [ ] Progress bar reaches 100% on final question

### Final Question
- [ ] On question 12, button shows "Complete" instead of "Next"
- [ ] "Complete" button is disabled until answer is selected
- [ ] Click "Complete" → Shows loading state ("Submitting...")
- [ ] Loading state disables navigation buttons

### Form Validation
- [ ] Cannot proceed without selecting an answer
- [ ] All 12 questions must be answered before submission
- [ ] Error handling if submission fails

---

## ✅ Quiz Submission

### API Integration
- [ ] Submit quiz → POST request sent to `/api/motivation/submit`
- [ ] Request body contains `userId` and `answers` array
- [ ] Each answer has `questionId` and `value`
- [ ] Response contains `profile` and `persona`

### Success Flow
- [ ] Successful submission → Redirects to `/motivation/result`
- [ ] Persona data is stored in localStorage
- [ ] No error messages shown

### Error Handling
- [ ] Network error → Shows error alert
- [ ] API error → Shows error message from API
- [ ] Invalid data → Shows validation error

---

## ✅ Persona Reveal Screen (`/motivation/result`)

### Page Display
- [ ] Page loads with "Meet Your Coach" header
- [ ] Persona card is displayed
- [ ] Avatar circle shows persona initials
- [ ] Persona name is displayed prominently
- [ ] Description text is readable

### Persona Details
- [ ] Persona name matches one of the 7 personas:
  - Coach Alex (Achievement)
  - Coach Sam (Autonomy)
  - Coach Jordan (Social)
  - Coach Morgan (Health Fear)
  - Coach Taylor (Independence)
  - Coach Casey (Mastery)
  - Coach Riley (Purpose)
- [ ] Description explains the persona's style
- [ ] Tone details section shows:
  - Formality level
  - Encouragement style
  - Directness level
  - Humor level

### Navigation
- [ ] "Continue to My Plan" button is visible
- [ ] Click button → Redirects to `/today`
- [ ] Persona data persists after navigation

### Edge Cases
- [ ] If no persona data → Shows "No persona data found" with link to quiz
- [ ] If not authenticated → Redirects to `/login`

---

## ✅ Persona Widget in Navbar

### Display
- [ ] After quiz completion → Persona widget appears in Navbar
- [ ] Widget shows avatar circle with initials
- [ ] On desktop → Shows persona name next to avatar
- [ ] On mobile → Shows only avatar (name hidden)
- [ ] Widget styling matches design system (blue background, border)

### Data Loading
- [ ] Widget loads persona from localStorage
- [ ] Widget appears on all pages after quiz completion
- [ ] Widget persists across page navigation
- [ ] Widget persists after page refresh

### Visual Design
- [ ] Avatar circle has proper size (32px)
- [ ] Initials are centered and readable
- [ ] Background color is subtle (primary/10)
- [ ] Border is visible but not overwhelming
- [ ] Spacing is appropriate

---

## ✅ Motivation Profile Calculation

### Profile Types
Test different answer combinations to verify persona assignment:

- [ ] **Achievement-focused answers** → Coach Alex
- [ ] **Autonomy-focused answers** → Coach Sam
- [ ] **Social-focused answers** → Coach Jordan
- [ ] **Health fear-focused answers** → Coach Morgan
- [ ] **Independence-focused answers** → Coach Taylor
- [ ] **Mastery-focused answers** → Coach Casey
- [ ] **Purpose-focused answers** → Coach Riley

### Scoring Logic
- [ ] Primary motivator is correctly identified
- [ ] Secondary motivators are included
- [ ] Scores are calculated for all motivator types

---

## ✅ Data Persistence

### User Record
- [ ] Motivation profile is saved to user record
- [ ] Coach persona is saved to user record
- [ ] Data persists after page refresh
- [ ] Data persists after logout/login

### LocalStorage
- [ ] Persona is stored in localStorage as `coachPersona`
- [ ] Stored data is valid JSON
- [ ] Data can be retrieved and parsed correctly

---

## ✅ UI/UX Polish

### Visual Consistency
- [ ] Quiz page matches onboarding design style
- [ ] Answer buttons have consistent styling
- [ ] Selected state is clear (blue border + left line)
- [ ] Hover effects work on answer buttons
- [ ] Progress bar animates smoothly

### Spacing & Layout
- [ ] Generous spacing between elements
- [ ] Text is readable (appropriate font sizes)
- [ ] Cards have proper padding
- [ ] Layout is responsive (mobile/tablet/desktop)

### Accessibility
- [ ] Keyboard navigation works (Tab through answers)
- [ ] Focus indicators are visible
- [ ] Button labels are clear
- [ ] Progress is announced to screen readers

---

## 🎯 Quick Test Scenario

**Happy Path:**
1. Navigate to `/motivation/quiz`
2. Answer all 12 questions:
   - Select different answers to test various motivators
   - Use Previous/Next to navigate
   - Verify progress bar updates
3. On question 12, click "Complete"
4. Verify redirect to `/motivation/result`
5. Verify persona reveal screen shows:
   - Persona name
   - Description
   - Tone details
6. Click "Continue to My Plan"
7. Verify redirect to `/today`
8. Verify persona widget appears in Navbar
9. Navigate to different pages → Widget persists
10. Refresh page → Widget still appears

---

## 📝 Notes

- Quiz questions cover 7 different motivator types
- Persona assignment is based on primary motivator
- Each persona has unique tone configuration
- Persona widget provides quick visual reference
- All data is validated using Zod schemas
- Pure logic in motivation-engine (no side effects)

