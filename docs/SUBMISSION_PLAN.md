# Competition Execution Plan — 7 Days

## Product objective
Convert the question “Why an AI PC?” into “I want to try this Intel AI PC” through a short, intuitive, in-store experience for shoppers with little prior technical knowledge.

## Proposed solution
Intel AI Quest is a touchscreen-first, 2–3 minute experience. A shopper selects a persona, plays short real-life challenges, explores AI workflows, receives a personalized buying checklist and is invited to try a compatible Intel AI PC in-store.

## Success metrics to measure
These are proposed pilot metrics, not achieved results:
- Experience start rate = starts / kiosk visitors who engage.
- Completion rate = completed quests / started quests.
- AI Studio engagement = AI Studio uses / completed quests.
- Store trial intent = shoppers who accept a staff demo / completed quests.
- Recommendation share rate = saved/copied results / completed quests.
- Median experience time.

## Team roles (3–4 members)
### Member 1 — Frontend and UX lead
- React screens, responsive design, animation, kiosk mode.
- Accessibility, navigation, touch target sizes and performance.
- Own final frontend build and demo reliability.

### Member 2 — Backend and AI lead
- FastAPI endpoints, SQLite analytics, optional Gemini integration.
- Prompt quality, fallback behavior, input limits and error handling.
- Clearly distinguish cloud AI from local NPU workloads.

### Member 3 — Product research and recommendation lead
- Shopper personas, challenge content, recommendation logic.
- Research comparable laptop configurations and verified Intel AI PC capabilities.
- Build product comparison framework and retail staff handoff.

### Member 4 (if available) — QA, pitch and visual storytelling
- Test flows and devices, capture screenshots/video.
- Create pitch deck, demo script, architecture diagram and report.
- Coordinate rehearsal and judge Q&A.

If only three people: Member 3 also owns pitch/research; rotate QA across all members.

## Day-by-day plan

### Day 1 — Lock the story and scope
- Agree on target shopper, core message and one main journey.
- Finalize personas, 3 challenge questions and success metrics.
- Confirm the exact Intel laptop available for the demo (if any).
- Create Git repository, assign issues and freeze MVP scope.
**Deliverable:** problem framing, user flow, wireframe and task board.

### Day 2 — Frontend MVP
- Build landing page, persona selection and game flow.
- Add scoring, feedback, result page and responsive design.
- Test on a laptop and touchscreen if available.
**Deliverable:** complete frontend journey using local data.

### Day 3 — Backend and AI Studio
- Implement FastAPI health, generate, recommend, session and analytics endpoints.
- Integrate Gemini optionally; implement fallback mode and error handling.
- Add SQLite persistence.
**Deliverable:** working full-stack app with no-key fallback.

### Day 4 — Product matching and proof points
- Build recommendation rules based on usage and budget.
- Research current comparable SKUs from retailer listings, with exact prices/specs and date captured.
- Add verified Intel AI PC explanation and a physical-device demo flow.
**Deliverable:** grounded comparison content and demo checklist.

### Day 5 — Retail polish and analytics
- Refine visual design, transitions, touch targets, copy and kiosk layout.
- Test offline mode, reloads, duplicate sessions, analytics and invalid inputs.
- Add privacy note and clear cloud-vs-on-device labels.
**Deliverable:** feature-complete candidate.

### Day 6 — QA, pitch and evidence
- Run full test matrix; fix critical bugs only.
- Capture clean screenshots and a short screen recording.
- Prepare architecture, impact measurement, limitations and future roadmap.
- Rehearse judge demo at least three times.
**Deliverable:** release candidate, pitch deck and demo recording.

### Day 7 — Freeze and submit
- Run production build and verify on the actual presentation device.
- Keep local offline fallback ready; carry hotspot as backup.
- Prepare backup video, screenshots, source ZIP and setup instructions.
- Finalize team speaking roles and judge Q&A.
**Deliverable:** submission package and rehearsed live demo.

## Test checklist
- [ ] Landing page loads at 1366×768 and mobile width.
- [ ] Each of four personas can complete all three challenges.
- [ ] Score is correct for all answer combinations.
- [ ] Result page reflects the chosen persona.
- [ ] Copy and download result actions work.
- [ ] AI Studio works with Gemini key.
- [ ] AI Studio fallback works without backend or key.
- [ ] API errors do not break the experience.
- [ ] Analytics records completed sessions only.
- [ ] No personal data is collected.
- [ ] No unsupported claim says Gemini/cloud output ran on Intel NPU.
- [ ] Exact demo laptop specs and app behavior are verified.
- [ ] `npm run build` succeeds.

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| Wi-Fi/API unavailable | Local deterministic fallback and preloaded demo text |
| No Intel hardware available | Present an honest clickable prototype; do not fake NPU telemetry |
| Unverified competitor claims | Compare exact configurations and cite dated retailer/manufacturer specs |
| Scope creep | Freeze the three-challenge MVP by Day 1 |
| Demo fails | Backup screen recording, screenshots and offline frontend |
| Privacy concerns | Anonymous aggregate analytics; no PII or sensitive uploads |

## Expected impact (to validate in pilot)
The product is designed to improve awareness, engagement, AI PC feature comprehension and store-demo intent. Do not claim conversion uplift until a real pilot measures it. Compare pre/post understanding with a one-question optional poll and record anonymous demo handoffs.
