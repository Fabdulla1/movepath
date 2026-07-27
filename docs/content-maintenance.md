# MovePath Content Maintenance

## Verifying Official Sources

Review each rule in `src/data/routes/us-to-germany.ts` against the linked official or authoritative source. Prefer German federal, municipal, EU, U.S. government, and official social-insurance sources. Do not add guessed URLs.

## Updating `lastVerified`

When a rule has been checked, update its `lastVerified` date through the shared `verified` constant or a rule-specific value if only one task was reviewed. Use the actual review date in `YYYY-MM-DD` format.

## Reviewing Changing Content

Immigration, tax, health-insurance, vehicle, pet, school, and registration content should be reviewed before meaningful releases and after known regulatory changes. Confirm both the source URL and the wording of the task.

## Marking a Rule Outdated

If a rule cannot be verified, set `outdated: true` on that rule and rewrite the description so users can see that it needs review. Do not leave outdated requirements phrased as current obligations.

## Adding or Removing Tasks

Add tasks by extending the route rule pack, not React components. Keep IDs stable once released so completion state can survive edits. If a task is removed, its completion state will be dropped by the rule engine when answers are edited.
