# Content Module

Static/reference data endpoints — categories, banks, and FAQ content. All public, no auth required.

## Endpoints

| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET    | `/api/v1/categories` | Public | ⬜ TODO |
| GET    | `/api/v1/banks/supported` | Public | ⬜ TODO |
| GET    | `/api/v1/content/faqs` | Public | ⬜ TODO |

## Notes

- Data is currently hardcoded in the controller. Move to DB or CMS if content needs to be dynamic.
- `/categories` is used by the create-goal form dropdown.
- `/banks/supported` is used by the landing page FAQ.
- `/content/faqs` is used by the landing page FAQ section.
- This router is mounted at three prefixes in `app.ts`: `/categories`, `/banks`, and `/content`.
