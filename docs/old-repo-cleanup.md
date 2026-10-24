# Cleaning up the old repo (Maur1k/JobFit-TailorUrResume-)

Run these yourself — they change your repo and your accounts.

## 1. Rotate first
A key that was ever public must be treated as leaked, even after you delete the file.
Open `.env` in the old repo, and for each value that is NOT a public Supabase URL / anon key
(for example a service-role key, database password, or any third-party API key), rotate it in
that provider's dashboard.

## 2. Stop tracking .env
    git clone https://github.com/Maur1k/JobFit-TailorUrResume-.git && cd JobFit-TailorUrResume-
    git rm --cached .env
    printf '\n.env\n.env.*\n!.env.example\n' >> .gitignore
    git add .gitignore && git commit -m "Stop tracking .env"

## 3. Remove it from history (optional once keys are rotated)
    pip install git-filter-repo
    git filter-repo --path .env --invert-paths
    git push --force origin main
Note: Lovable syncs this repo, so force-pushing can conflict with its sync. Rotating keys is what
actually protects you; history rewriting is cleanup.

## 4. Fix the README link
The README says the live app is https://maujobfit.lovable.app, but the live site is
https://pagawa-resume.lovable.app. Edit the "Live App" line, then:
    git commit -am "Fix live app link" && git push
After the rebuild goes live, replace this repo's README with a pointer to the new repo and archive it.
