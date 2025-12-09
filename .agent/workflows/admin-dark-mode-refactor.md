---
description: Refactor Admin Pages to Dark Mode
---

# Admin Dark Mode Refactor

This workflow documents the steps taken to refactor the admin section of the application to support dark mode using theme variables.

## Steps

1.  **Identify Hardcoded Colors**:
    *   Search for hardcoded Tailwind CSS color classes (e.g., `bg-white`, `text-gray-900`, `border-gray-200`, `bg-green-50`).
    *   Identify usage of hardcoded gradients (e.g., `bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50`).

2.  **Replace with Theme Variables**:
    *   **Backgrounds**:
        *   `bg-page-gradient`: Use for main page backgrounds.
        *   `bg-card`: Use for cards and containers.
        *   `bg-background`: Use for general backgrounds.
        *   `bg-muted/50` or `bg-muted`: Use for secondary backgrounds (e.g., table headers, hover states).
    *   **Text**:
        *   `text-foreground`: Use for primary text.
        *   `text-muted-foreground`: Use for secondary text.
        *   `text-primary`: Use for primary branding text.
        *   `text-destructive`: Use for error/delete actions.
    *   **Borders**:
        *   `border-border` or `border-border/50`: Use for general borders.
        *   `border-input`: Use for form inputs.
    *   **Inputs & Form Elements**:
        *   Ensure inputs have `bg-background`, `text-foreground`, `border-input`.
        *   Add focus rings: `focus:ring-2 focus:ring-primary focus:border-primary`.

3.  **Refactor Specific Components**:
    *   **Admin Page (`app/admin/page.tsx`)**: Refactor main stats cards, charts, and navigation tabs.
    *   **Analytics Page (`app/admin/analytics/page.tsx`)**: Refactor charts, metrics cards, and time range selectors.
    *   **Badges Page (`app/admin/badges/page.tsx`)**: Refactor badge creation forms, badge lists, and award modals.
    *   **Content Page (`app/admin/content/page.tsx`)**: Refactor content lists, stats, and filter components.
    *   **Users Page (`app/admin/users/page.tsx`)**: Refactor user tables, filters, and pagination.
    *   **Create Forms (`app/admin/content/*/create/page.tsx`)**: Refactor course, lesson, and quiz creation forms.

4.  **Verify Dark Mode**:
    *   Check all pages in both light and dark modes to ensure contrast and visibility.
    *   Ensure gradients adapt gracefully (e.g., using `dark:from-... dark:to-...` or finding a neutral `bg-page-gradient`).

5.  **Status**:
    *   Completed refactoring for `admin` root, `analytics`, `badges`, `content`, and `users`.
