# Payment Redirect Fix Guide

## Problem
After deploying to Vercel, payment redirects are going to `localhost:3000` instead of your production URL.

## Root Cause
The backend is using `process.env.FRONTEND_URL` which defaults to `https://microlearning-beta.vercel.app` when not set.

```typescript
// From course.payment.controller.ts
const frontendUrl = process.env.FRONTEND_URL || 'https://microlearning-beta.vercel.app';
res.redirect(`${frontendUrl}/courses/payment/success?courseId=${courseId}`);
```

## Solution

### Step 1: Set Environment Variable in Backend

#### If Backend is on Render:
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to "Environment" tab
4. Add new environment variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app`
5. Click "Save Changes"
6. Backend will auto-redeploy

#### If Backend is on Railway:
1. Go to https://railway.app
2. Select your backend project
3. Go to "Variables" tab
4. Add new variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app`
5. Click "Add"
6. Redeploy if needed

#### If Backend is on Heroku:
```bash
heroku config:set FRONTEND_URL=https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app -a your-app-name
```

#### If Backend is Self-Hosted:
Add to your `.env` file:
```env
FRONTEND_URL=https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app
```

### Step 2: Verify Environment Variable

After setting the variable, verify it's working:

1. **Check backend logs** to see if the variable is loaded
2. **Test payment flow** - it should redirect to production URL
3. **Check redirect URLs** in payment success/fail/cancel

### Step 3: Update for Custom Domain (Optional)

If you add a custom domain to Vercel later:

1. Update `FRONTEND_URL` to your custom domain:
   ```
   FRONTEND_URL=https://yourdomain.com
   ```
2. Redeploy backend

## Payment Flow After Fix

```
User initiates payment
    ↓
SSLCommerz payment gateway
    ↓
Payment completed
    ↓
SSLCommerz calls backend webhook
    ↓
Backend processes payment
    ↓
Backend redirects to: 
  ✅ https://your-vercel-app.vercel.app/courses/payment/success
  (NOT localhost:3000)
```

## Testing

### Test Success Flow:
1. Go to a course page
2. Click "Enroll Now" or "Buy Course"
3. Complete payment on SSLCommerz
4. Should redirect to: `https://your-app.vercel.app/courses/payment/success?courseId=xxx`

### Test Fail Flow:
1. Initiate payment
2. Cancel or fail payment
3. Should redirect to: `https://your-app.vercel.app/courses/payment/fail`

## Important Notes

1. **Update after each Vercel deployment**: If Vercel changes your URL, update `FRONTEND_URL`
2. **Use custom domain**: Consider adding a custom domain to avoid URL changes
3. **CORS settings**: Make sure backend CORS allows your Vercel domain
4. **Environment variables**: Backend uses the same variable for CORS origin

## Current URLs

- **Frontend (Vercel)**: https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app
- **Backend**: (Check your backend deployment URL)
- **Required Variable**: `FRONTEND_URL=https://microlearning-cjzp6gxxn-reduan-ahmads-projects.vercel.app`

## Verification Checklist

- [ ] `FRONTEND_URL` environment variable set in backend
- [ ] Backend redeployed with new variable
- [ ] Payment success redirects to production URL
- [ ] Payment fail redirects to production URL
- [ ] Payment cancel redirects to production URL
- [ ] CORS allows production frontend domain

## Common Issues

### Issue 1: Still redirecting to localhost
**Solution**: Make sure backend is redeployed after adding environment variable

### Issue 2: CORS error after redirect
**Solution**: Check that `FRONTEND_URL` is also used in CORS configuration

### Issue 3: Payment webhook not working
**Solution**: Verify SSLCommerz has correct backend webhook URLs

## Need Help?

If you're still having issues:
1. Check backend logs for the actual `FRONTEND_URL` value
2. Verify environment variable is set correctly
3. Ensure backend is redeployed
4. Test with a small payment first
