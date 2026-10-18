# Gloomlet final submission checklist

Use this checklist against the deployed Vercel site and the Render API. Mark an item complete only after testing it.

## 1. Build and repository
- [ ] In `client/`, run `npm run build` and confirm it exits successfully.
- [ ] Start locally with `npm run dev` and inspect the browser console.
- [ ] Check the repository with `git status` and review every changed file.
- [ ] Confirm no `.env` files, private keys, database credentials, or tokens are committed.
- [ ] Confirm the latest intended commit is pushed to `origin/main`.

## 2. Core experience
- [ ] Hero loads correctly and primary navigation links work.
- [ ] Origin story chapters and navigation work without overlapping content.
- [ ] At least three project entries have accurate descriptions and working links.
- [ ] Dreamscape stops can be selected with mouse and keyboard.
- [ ] Dreamscape progress and reset behavior are understandable.
- [ ] Guestbook validates empty/too-long messages and shows helpful feedback.
- [ ] Guestbook messages remain after refresh if persistent storage is intended.
- [ ] Visitor counter loads, refreshes, and does not misleadingly claim a unique global count if it is session-based.
- [ ] Easter egg can be discovered, opened, and dismissed.
- [ ] Lullaby Lab starts only after user interaction; play/pause, mute, volume, and tempo work.
- [ ] Audio is stopped or cleaned up when leaving the component, where applicable.
- [ ] Day/night and sound controls remain usable on small screens.

## 3. Responsive design
- [ ] Test widths around 360px, 390px, 768px, and desktop.
- [ ] No horizontal page overflow.
- [ ] Buttons and interactive map points are comfortably tappable.
- [ ] Text is readable and cards do not collide or clip.
- [ ] Images and decorative effects do not cover important controls.

## 4. Accessibility and motion
- [ ] Navigate the whole site using Tab, Shift+Tab, Enter, and Space.
- [ ] Keyboard focus is visible.
- [ ] Inputs and icon-only controls have accessible names.
- [ ] Text has sufficient contrast against its background.
- [ ] Reduced-motion preference is respected for major animations.
- [ ] The site remains understandable when sound is muted.

## 5. Deployment and APIs
- [ ] Open the deployed Vercel URL in a private/incognito window.
- [ ] Refresh the page and confirm it still loads.
- [ ] Test the Render health endpoint and verify the actual database status.
- [ ] Check browser Network tools for failed API requests and CORS errors.
- [ ] Test API-dependent features when the backend is temporarily unavailable.
- [ ] Confirm secrets are stored in deployment environment variables, not frontend source.
- [ ] Confirm the public site is not blocked by deployment protection.

## 6. Final decision
- [ ] All critical interactions work on the deployed URL.
- [ ] No blocking console errors remain.
- [ ] Project links and descriptions are accurate.
- [ ] Demo script has been rehearsed at least once.
- [ ] Any known limitations are documented honestly.
