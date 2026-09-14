# Walkthrough script — Continuous Assurance

**Tone:** spoken, while you click  
**Length:** about 4–5 minutes

---

## Open

So this is Continuous Assurance — I put the mockup together. I’ve already been working with Jonathan and Matthew on the features and the design. The next design pass is still in progress; I’m working that toward a proper prototype. So what you’re looking at today is a temporary design of the product.

Alright, let’s start with the platform.

This example is for a PE sponsor, like BV — they have a lot of companies. From here we can monitor them, and we can pick which company we’re looking at. I’ll just walk through each module, short, and only what’s on the screen.

Up here you can switch companies. This one’s Northwind — fictional tenant, just for the demo.

---

## Overview

This is the first screen.

You’ve got the overall risk score and grade. Next to that, findings split by severity, and coverage: what’s been human-validated, what’s automated, and what hasn’t been checked yet.

This strip is the cycle: Discover, Validate, Prioritize, Remediate.

Below that, top issues — the queue you’d actually work first. There’s also the trend and recent activity.

---

## Attack Surface

This is the inventory of what’s visible from the internet.

You can look at it as a table, a topology map, or by cloud region. Filters and search are here. Unscanned assets stay visible — we don’t hide the gaps.

---

## Findings

Every finding has a validation badge. You can filter by severity, KEV, or anything still waiting on a human.

Open one and you get evidence, business impact, and the actions: request validation, retest, or close.

---

## Remediation & Verification

Kanban. You can move cards, but you can’t drop them straight into Closed.

They have to go through verification first. After that, you get a dated closure certificate.

---

## Testing Cycle

This is what ties monitoring back to pentest work.

You’ve got the schedule, the human-validation quota, the next test scope suggested from monitoring data, and the testing history.

Retests don’t burn quota.

---

## Evidence Readiness

This isn’t a compliance platform. It’s just technical evidence you can attach: CIS, technical SOC 2, ISO, plus the insurance binder.

---

## Reports

Four report types: executive, technical, IC for PE, and the underwriter binder.

That last one is the differentiator. Same data, different audience.

---

## PE Portfolio

This is the sponsor view.

Portfolio score, companies that need attention, the risk matrix, the company list, and the due diligence pipeline.

You can switch tenants from here as well.

---

## Compare

If we have a minute: we’re closest to Rapid7 Vector Command. We’re deliberately not chasing Exposure Command with all the agents.

What we put in front: validation labels in the UI, closure certificates, PE, and the insurance binder.

---

## Close

That’s the flow. Watch it, prove it, close it, then produce a report people can actually use.

Anything you want me to click back into?
