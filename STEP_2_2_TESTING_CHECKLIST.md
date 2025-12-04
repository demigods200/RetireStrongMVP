# Step 2.2 Testing Checklist: Real Authentication Flow

## What Was Added in Step 2.2

### 1. **Domain Core Package** (`packages/domain-core`)
   - ✅ `User` model with basic fields (userId, email, firstName, lastName, timestamps)
   - ✅ `UserRepo` - DynamoDB repository for user operations
   - ✅ `UserService` - Business logic layer for user management

### 2. **Shared API Package** (`packages/shared-api`)
   - ✅ `SignupRequestSchema` - Zod validation for signup requests
   - ✅ `LoginRequestSchema` - Zod validation for login requests
   - ✅ `AuthResponseSchema` - Response format for auth operations
   - ✅ `UserSchema` - User DTO schema

### 3. **API Gateway Handlers** (`apps/api-gateway`)
   - ✅ `auth/signup.ts` - Signup handler (Cognito + DynamoDB)
   - ✅ `auth/login.ts` - Login handler (Cognito authentication)
   - ✅ `lib/auth.ts` - AuthService wrapper for AWS Cognito
   - ✅ Updated `template.yaml` with signup/login endpoints

### 4. **Frontend Auth Pages** (`apps/web`)
   - ✅ `/signup` - Sign up page with form
   - ✅ `/login` - Login page with form
   - ✅ `/account` - Account page (protected route)
   - ✅ `SignupForm` component
   - ✅ `LoginForm` component
   - ✅ Auth guards (`useAuthGuard`, `useGuestGuard`)
   - ✅ Next.js API routes (`/api/auth/signup`, `/api/auth/login`)

### 5. **Bug Fixes**
   - ✅ Fixed root page client component issue
   - ✅ Fixed TypeScript build errors
   - ✅ Fixed Next.js Suspense boundary for `useSearchParams`

---

## What to Check (Testing Checklist)

### ✅ **1. Code Structure Verification**

- [ ] Verify all packages build successfully:
  ```bash
  pnpm build
  ```
  Should complete without errors.

- [ ] Check that new files exist:
  - `packages/domain-core/src/models/User.ts`
  - `packages/domain-core/src/repos/UserRepo.ts`
  - `packages/domain-core/src/services/UserService.ts`
  - `packages/shared-api/src/schemas/auth.ts`
  - `packages/shared-api/src/schemas/user.ts`
  - `apps/api-gateway/src/handlers/auth/signup.ts`
  - `apps/api-gateway/src/handlers/auth/login.ts`
  - `apps/web/src/features/auth/components/SignupForm.tsx`
  - `apps/web/src/features/auth/components/LoginForm.tsx`
  - `apps/web/src/app/signup/page.tsx`
  - `apps/web/src/app/login/page.tsx`
  - `apps/web/src/app/account/page.tsx`

### ✅ **2. Frontend UI Testing**

#### **Home Page** (`http://localhost:3000`)
- [ ] Page loads without errors
- [ ] Layout and Navbar display correctly
- [ ] All navigation links work
- [ ] "Get Started" button is visible and clickable

#### **Signup Page** (`http://localhost:3000/signup`)
- [ ] Page loads successfully
- [ ] Form fields are visible:
  - First Name input
  - Last Name input
  - Email input
  - Password input (minimum 8 characters)
- [ ] Form validation works:
  - Try submitting empty form → should show errors
  - Try invalid email → should show error
  - Try password < 8 chars → should show error
- [ ] "Create Account" button is visible
- [ ] "Sign in here" link works and goes to `/login`
- [ ] Form styling is 50+ friendly (large inputs, clear labels)

#### **Login Page** (`http://localhost:3000/login`)
- [ ] Page loads successfully
- [ ] Form fields are visible:
  - Email input
  - Password input
- [ ] "Sign In" button is visible
- [ ] "Create one here" link works and goes to `/signup`
- [ ] If redirected from signup with `?signup=success`, success message appears
- [ ] Form styling is 50+ friendly

#### **Account Page** (`http://localhost:3000/account`)
- [ ] If not logged in → redirects to `/login`
- [ ] If logged in → shows account page
- [ ] Displays placeholder user information
- [ ] "Sign Out" button is visible
- [ ] "Sign Out" button works (clears tokens, redirects to login)

### ✅ **3. Navigation & Auth Guards**

#### **Auth Guards (Protected Routes)**
- [ ] Try accessing `/account` without login → should redirect to `/login`
- [ ] Try accessing `/today` without login → should redirect to `/login` (if guard is added)
- [ ] Try accessing `/plan` without login → should redirect to `/login` (if guard is added)

#### **Guest Guards (Auth Pages)**
- [ ] If logged in and visit `/login` → should redirect to `/today`
- [ ] If logged in and visit `/signup` → should redirect to `/today`

#### **Navigation**
- [ ] All navbar links work
- [ ] Active page is highlighted in navbar
- [ ] Mobile menu works (if testing on mobile/small screen)

### ✅ **4. API Integration Testing**

**Note:** These tests require AWS Cognito and DynamoDB to be set up. For now, you can verify the code structure.

#### **API Routes (Next.js)**
- [ ] `/api/auth/signup` route exists
- [ ] `/api/auth/login` route exists
- [ ] Routes forward requests to API Gateway (when configured)

#### **API Gateway Handlers (Lambda)**
- [ ] `signup.ts` handler exists and exports correctly
- [ ] `login.ts` handler exists and exports correctly
- [ ] Handlers use Zod schemas for validation
- [ ] Handlers have proper error handling

### ✅ **5. Type Safety & Build**

- [ ] TypeScript compiles without errors:
  ```bash
  pnpm build
  ```
- [ ] No linter errors:
  ```bash
  pnpm --filter web lint
  ```
- [ ] All imports resolve correctly
- [ ] Shared packages are properly linked in workspace

### ✅ **6. Code Quality Checks**

- [ ] Domain logic is in `domain-core` (not in handlers)
- [ ] Validation schemas are in `shared-api`
- [ ] Handlers are thin (just parse, validate, call services)
- [ ] Components follow 50+ friendly design principles
- [ ] Error handling is present in forms and handlers

---

## Known Limitations (Will Be Fixed in Future Steps)

1. **AWS Resources Not Deployed Yet**
   - Cognito User Pool needs to be created
   - DynamoDB Users table needs to be created
   - Environment variables need to be configured

2. **JWT Decoding**
   - Login handler doesn't decode JWT yet (returns basic info)
   - Will be implemented in production

3. **Token Storage**
   - Currently using localStorage (not ideal for production)
   - Will be improved with httpOnly cookies

4. **User Lookup**
   - `getUserByEmail` not implemented yet (placeholder)
   - Will use GSI (Global Secondary Index) in production

---

## Quick Test Commands

```bash
# Build all packages
pnpm build

# Start dev server (if not already running)
pnpm --filter web dev

# Check TypeScript errors
pnpm --filter web type-check
pnpm --filter api-gateway type-check
pnpm --filter domain-core type-check
pnpm --filter shared-api type-check
```

---

## What's Next?

After verifying Step 2.2, the next step is:
- **Step 3.1: Onboarding Profile** - Build the motivation quiz and profile creation flow

---

**Step 2.2 Status:** ✅ Code Complete - Ready for Testing

