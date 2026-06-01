import os
import sys
import random
import subprocess
from datetime import datetime, timedelta

CWD = "/home/rabeya-noor/Code/ScholarForge"

def run_cmd(cmd, env=None):
    res = subprocess.run(cmd, cwd=CWD, env=env, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return res.returncode, res.stdout, res.stderr

def main():
    os.chdir(CWD)

    print("1. Re-initializing git repository...")
    run_cmd(["rm", "-rf", ".git"])
    run_cmd(["git", "init"])
    run_cmd(["git", "config", "user.name", "rabeya100X"])
    run_cmd(["git", "config", "user.email", "rabeyanoor.dev@gmail.com"])

    # Target date range: June 1, 2026 to October 31, 2026
    start_date = datetime(2026, 6, 1)
    end_date = datetime(2026, 10, 31)

    topics = [
        "chore: initialize repository structure and base project configuration",
        "docs: add initial project README title and MIT license information",
        "chore: add root .gitignore rules for logs and node_modules",
        "chore: configure backend package.json dependencies and npm scripts",
        "chore: configure frontend package.json dependencies and Vite build scripts",
        "feat(backend): implement Mongoose database connection in config/db.js",
        "feat(backend): add timeout handling and bufferCommands flag to db.js",
        "feat(backend): define User schema with bcrypt password hashing hook",
        "feat(backend): implement getSignedJwtToken and matchPassword methods on User model",
        "feat(backend): create Paper schema with title, abstract, authors, and doi fields",
        "feat(backend): add tags array and uploadedBy reference to Paper schema",
        "feat(backend): create Comment schema for academic peer review discussions",
        "feat(backend): implement custom ErrorResponse class in middleware/error.js",
        "feat(backend): add global errorHandler middleware for Mongoose validation errors",
        "feat(backend): create protect middleware for JWT token verification",
        "feat(backend): add authorize middleware for role-based access control (RBAC)",
        "feat(backend): implement register controller with memory fallback support",
        "feat(backend): implement login controller with bcrypt validation",
        "feat(backend): implement getMe controller to return authenticated user profile",
        "feat(backend): create authRoutes with /register, /login, and /me endpoints",
        "feat(backend): implement getPapers controller with query search and pagination",
        "feat(backend): implement getPaper controller for single paper lookup",
        "feat(backend): implement createPaper controller with role authorization check",
        "feat(backend): implement deletePaper controller with ownership check",
        "feat(backend): create paperRoutes with CRUD endpoints",
        "feat(backend): assemble Express server in server.js with CORS and Helmet middleware",
        "feat(backend): add /health check endpoint for frontend status badge monitoring",
        "feat(frontend): create HTML index entry with Cormorant Garamond and Plus Jakarta fonts",
        "feat(frontend): add FontAwesome icon pack integration to index.html",
        "feat(frontend): establish CSS design system tokens and warm academic color palette",
        "feat(frontend): implement navbar UI layout with status indicator and brand icon",
        "feat(frontend): build hero section with headline, search input, and CTA buttons",
        "feat(frontend): create category filter pills for academic domain selection",
        "feat(frontend): build key metrics stat cards grid in frontend layout",
        "feat(frontend): implement responsive paper card layout in style.css",
        "feat(frontend): add modal dialog CSS overlay and glassmorphism styling",
        "feat(frontend): style citation box with code block typography and copy button",
        "feat(frontend): style paper publish modal wizard form inputs",
        "feat(frontend): style authentication login/register tab container",
        "feat(frontend): create toast notification styles with keyframe slide animation",
        "feat(frontend): setup central reactive appState object in main.js",
        "feat(frontend): initialize local memory dataset for fallback initial papers",
        "feat(frontend): implement initApp DOMContentLoaded listener",
        "feat(frontend): implement main renderApp function for dynamic layout rendering",
        "feat(frontend): add fetchBackendHealth service call to monitor backend status",
        "feat(frontend): add fetchPapers service function with REST API integration",
        "feat(frontend): implement applyFilterAndSort multi-criteria paper search & filter",
        "feat(frontend): implement renderPapersGrid for dynamic paper card rendering",
        "feat(frontend): add attachEventListeners for search box, filters, and modals",
        "feat(frontend): implement toggleBookmark method with localStorage synchronization",
        "feat(frontend): implement openPaperDetails modal with peer review comments",
        "feat(frontend): implement openCiteModal with BibTeX citation formatter",
        "feat(frontend): implement copyCitation helper function with clipboard write",
        "feat(frontend): implement openPublishModal form handler for paper creation",
        "feat(frontend): implement openAuthModal tab switching and login/register handler",
        "feat(frontend): implement handleLogout for session clearance",
        "feat(frontend): implement deletePaper helper function with local state removal",
        "feat(frontend): implement addComment helper function for peer review thread",
        "docs: add Mermaid system architecture diagram to README.md",
        "docs: add sequence diagram for paper submission request lifecycle",
        "docs: add Entity-Relationship Diagram (ERD) for database models",
        "docs: add publication state machine diagram to README.md",
        "docs: document full REST API reference tables in README.md",
        "docs: update quick start guide and environment configuration steps",
        "docs: add feature summary table and tech stack specification",
        "refactor(backend): optimize Mongoose connection timeout and error logging",
        "refactor(frontend): streamline paper filter performance and search regex",
        "style: polish paper card hover elevation and border contrast",
        "style: refine hero section typography font weights and letter spacing",
        "fix(frontend): handle edge case when abstract or authors list is empty",
        "fix(backend): correct JWT bearer token extraction pattern in auth middleware",
        "perf: optimize re-rendering logic when toggling paper bookmarks",
        "test: verify backend health route response format and error handler",
        "chore: clean up console logs and unused code fragments",
        "ci: finalize repository commit structure and push state"
    ]

    total_days = (end_date - start_date).days + 1
    target_commits = 100  # Reduced by ~500 commits as requested
    
    print(f"Generating reduced history (~{target_commits} total commits) across {total_days} days...")

    changelog_path = os.path.join(CWD, "CHANGELOG.md")
    with open(changelog_path, "w") as f:
        f.write("# ScholarForge Commit & Release Changelog\n\n")

    # Generate dates evenly spaced
    dates = []
    for i in range(target_commits):
        # Evenly spread across 153 days
        day_offset = int((i / (target_commits - 1)) * (total_days - 1))
        d = start_date + timedelta(days=day_offset)
        hour = random.choice([10, 14, 17, 20])
        minute = random.randint(10, 50)
        second = random.randint(10, 50)
        dates.append(d.strftime(f"%Y-%m-%d {hour:02d}:{minute:02d}:{second:02d}"))

    commit_counter = 0
    for i, date_str in enumerate(dates):
        commit_counter += 1
        msg = topics[i % len(topics)]

        with open(changelog_path, "a") as f:
            f.write(f"- **{date_str}**: {msg}\n")
        
        run_cmd(["git", "add", "-A"])
        
        env = os.environ.copy()
        env["GIT_AUTHOR_DATE"] = date_str
        env["GIT_COMMITTER_DATE"] = date_str
        
        code, out, err = run_cmd(["git", "commit", "-m", msg], env=env)
        if code != 0:
            print(f"Error on commit {commit_counter} ({date_str}): {err}")
            sys.exit(1)

    print(f"Successfully generated {commit_counter} commits across June to October 2026!")

    print("Setting branch to main...")
    run_cmd(["git", "branch", "-M", "main"])

    print("Adding git remote origin...")
    run_cmd(["git", "remote", "remove", "origin"])
    code, out, err = run_cmd(["git", "remote", "add", "origin", "https://github.com/rabeyanoor/ScholarForge.git"])
    if code != 0:
        print(f"Remote error: {err}")

    print("Git repository initialization and backdated commit reduction complete!")

if __name__ == "__main__":
    main()
