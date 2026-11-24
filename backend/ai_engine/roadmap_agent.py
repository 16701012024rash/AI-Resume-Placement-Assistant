import re

from .free_resources import resources_for_week
from .schemas import RoadmapRequest, RoadmapResponse, WeekPlan


_CURRICULA = {
    "frontend": [
        {
            "focus": ["HTML", "CSS", "Responsive UI"],
            "matches": ["html", "css", "responsive", "accessibility", "semantic"],
            "study": "semantic HTML, responsive CSS, and accessible UI fundamentals",
            "practice": "responsive layouts, keyboard navigation, and form states",
            "deliverable": "an accessible, responsive product or portfolio page",
            "objective": "Create an accessible responsive interface",
        },
        {
            "focus": ["JavaScript", "TypeScript", "Web APIs"],
            "matches": ["javascript", "typescript", "async", "api", "browser"],
            "study": "JavaScript modules, asynchronous code, TypeScript, and browser APIs",
            "practice": "typed functions, async requests, and loading/error states",
            "deliverable": "a typed feature that consumes an API and handles errors",
            "objective": "Build reliable typed interactions with real data",
        },
        {
            "focus": ["React", "State Management", "UI Testing"],
            "matches": ["react", "state", "component", "testing", "test"],
            "study": "React components, hooks, state, and component testing",
            "practice": "reusable components, forms, and user-interaction tests",
            "deliverable": "a tested React dashboard with reusable components",
            "objective": "Build and test a maintainable React application",
        },
        {
            "focus": ["Performance", "Accessibility", "Portfolio"],
            "matches": ["performance", "accessibility", "portfolio", "project", "interview"],
            "study": "frontend performance, accessibility audits, and deployment basics",
            "practice": "Lighthouse checks, keyboard-only flows, and frontend interview questions",
            "deliverable": "a polished portfolio project with a live demo and project README",
            "objective": "Ship and present a portfolio-ready frontend project",
        },
    ],
    "backend": [
        {
            "focus": ["Python or Node.js", "REST APIs", "Validation"],
            "matches": ["python", "node", "fastapi", "django", "express", "api", "rest"],
            "study": "your backend language, HTTP, REST conventions, and request validation",
            "practice": "API handlers, input validation, status codes, and error responses",
            "deliverable": "a documented REST API with validation and consistent errors",
            "objective": "Design a reliable REST API",
        },
        {
            "focus": ["SQL", "Data Modeling", "Persistence"],
            "matches": ["sql", "database", "postgres", "data modeling", "mongodb"],
            "study": "relational modeling, SQL joins, indexes, and transaction basics",
            "practice": "schema design, joins, pagination, and CRUD queries",
            "deliverable": "a database-backed API feature with a documented schema",
            "objective": "Persist and query application data safely",
        },
        {
            "focus": ["Authentication", "Testing", "Security"],
            "matches": ["auth", "security", "testing", "test", "jwt"],
            "study": "authentication flows, secure configuration, and automated API tests",
            "practice": "authorization cases, invalid input, and failure-path tests",
            "deliverable": "a protected API with tests for success and failure cases",
            "objective": "Secure and verify backend behavior",
        },
        {
            "focus": ["System Design", "Deployment", "Portfolio"],
            "matches": ["system design", "cloud", "deployment", "portfolio", "project"],
            "study": "API scalability, logging, deployment concepts, and backend interviews",
            "practice": "system-design prompts, API documentation, and troubleshooting scenarios",
            "deliverable": "a complete backend capstone with architecture notes and README",
            "objective": "Present a production-minded backend capstone",
        },
    ],
    "data": [
        {
            "focus": ["Excel", "Data Cleaning", "Data Quality"],
            "matches": ["excel", "spreadsheet", "cleaning", "data quality"],
            "study": "spreadsheet formulas, data types, and a repeatable cleaning workflow",
            "practice": "cleaning a public dataset and checking for missing or inconsistent values",
            "deliverable": "a cleaned dataset with a short data-quality report",
            "objective": "Turn raw data into a trustworthy analysis dataset",
        },
        {
            "focus": ["SQL", "Data Extraction", "Analysis"],
            "matches": ["sql", "database", "query", "analytics"],
            "study": "SQL filtering, joins, aggregations, and window functions",
            "practice": "answering business questions with at least 8 SQL queries",
            "deliverable": "a saved SQL analysis with query notes and result checks",
            "objective": "Answer business questions with reproducible SQL",
        },
        {
            "focus": ["Python", "pandas", "Statistics"],
            "matches": ["python", "pandas", "statistics", "probability"],
            "study": "pandas transformations, descriptive statistics, and chart selection",
            "practice": "an exploratory analysis with documented assumptions and charts",
            "deliverable": "a notebook explaining trends, outliers, and limitations",
            "objective": "Explain a dataset with sound statistical reasoning",
        },
        {
            "focus": ["Visualization", "Business Insights", "Portfolio"],
            "matches": ["visualization", "dashboard", "portfolio", "project", "communication"],
            "study": "dashboard design, metric definitions, and presenting concise recommendations",
            "practice": "building a dashboard and presenting three evidence-backed insights",
            "deliverable": "a portfolio case study with dashboard, findings, and recommendations",
            "objective": "Present a complete data-analysis case study",
        },
    ],
    "ai": [
        {
            "focus": ["Python", "Data Preparation", "Math Foundations"],
            "matches": ["python", "statistics", "probability", "linear algebra", "data"],
            "study": "Python data workflows, probability, and the math behind model evaluation",
            "practice": "preparing a dataset and checking leakage, missing values, and class balance",
            "deliverable": "a reproducible data-preparation notebook with documented assumptions",
            "objective": "Prepare reliable data for machine learning",
        },
        {
            "focus": ["Machine Learning", "Feature Engineering", "Evaluation"],
            "matches": ["machine learning", "scikit", "feature", "model", "evaluation"],
            "study": "supervised learning, feature engineering, baselines, and evaluation metrics",
            "practice": "comparing a baseline with two models using an appropriate metric",
            "deliverable": "a model experiment with reproducible results and error analysis",
            "objective": "Train and evaluate a model responsibly",
        },
        {
            "focus": ["Deep Learning", "Inference APIs", "Testing"],
            "matches": ["deep learning", "pytorch", "neural", "api", "testing"],
            "study": "neural-network fundamentals, inference, and model-serving patterns",
            "practice": "building a small inference endpoint and tests for edge cases",
            "deliverable": "a tested inference service with clear input/output contracts",
            "objective": "Integrate a model into a reliable service",
        },
        {
            "focus": ["AI Capstone", "Evaluation", "Portfolio"],
            "matches": ["ai", "llm", "portfolio", "project", "deployment", "ethics"],
            "study": "end-to-end AI system design, evaluation, limitations, and responsible use",
            "practice": "measuring quality on a held-out test set and analyzing failure cases",
            "deliverable": "a reproducible AI capstone with evaluation results and README",
            "objective": "Ship and explain an evaluated AI project",
        },
    ],
    "software": [
        {
            "focus": ["Data Structures", "Algorithms", "Problem Solving"],
            "matches": ["dsa", "algorithm", "data structure", "problem solving", "complexity"],
            "study": "arrays, hash maps, stacks, queues, and time/space complexity",
            "practice": "solving 8 role-level problems and explaining the trade-offs",
            "deliverable": "a reviewed problem set with tests and complexity notes",
            "objective": "Build a repeatable approach to coding problems",
        },
        {
            "focus": ["OOP", "APIs", "Code Design"],
            "matches": ["oop", "object-oriented", "api", "design pattern", "clean code"],
            "study": "object-oriented design, modular code, and API boundaries",
            "practice": "refactoring a small feature and implementing a documented API",
            "deliverable": "a modular application feature with clear interfaces",
            "objective": "Design software that is understandable and extensible",
        },
        {
            "focus": ["SQL", "Testing", "Git"],
            "matches": ["sql", "database", "testing", "test", "git", "version control"],
            "study": "database fundamentals, automated tests, and collaborative Git workflows",
            "practice": "adding persistence, unit tests, and a reviewable feature branch",
            "deliverable": "a tested, database-backed feature with setup instructions",
            "objective": "Deliver a tested feature from code to data",
        },
        {
            "focus": ["System Design", "Capstone", "Interview Prep"],
            "matches": ["system design", "portfolio", "project", "interview", "cloud"],
            "study": "system-design fundamentals and explaining engineering decisions",
            "practice": "solving timed coding questions and reviewing a design trade-off",
            "deliverable": "a polished capstone repository with design notes and demo",
            "objective": "Present a complete software-engineering portfolio project",
        },
    ],
}


def _curriculum_for_role(target_role: str) -> list[dict]:
    role = target_role.lower()
    if "front" in role or "ui" in role:
        return _CURRICULA["frontend"]
    if "back" in role or "api" in role:
        return _CURRICULA["backend"]
    if "data" in role or "analyst" in role:
        return _CURRICULA["data"]
    if "ai" in role or "machine learning" in role:
        return _CURRICULA["ai"]
    return _CURRICULA["software"]


def _weeks_stages(week: int, total_weeks: int, stage_count: int) -> list[int]:
    start = ((week - 1) * stage_count) // total_weeks
    end = (week * stage_count) // total_weeks
    if end <= start:
        end = start + 1
    return list(range(start, min(end, stage_count)))


def _stage_skills(stage: dict, priorities: list[str]) -> list[str]:
    matches = [
        skill for skill in priorities
        if any(term in skill.lower() for term in stage["matches"])
    ]
    return matches[:2] or stage["focus"]


def _weekly_tasks(stages: list[dict], occurrence: int, known_skills: list[str]) -> list[str]:
    topics = ", ".join(stage["study"] for stage in stages)
    practice = "; ".join(stage["practice"] for stage in stages)
    deliverables = "; ".join(stage["deliverable"] for stage in stages)
    known = ", ".join(known_skills)
    if occurrence == 0:
        if known:
            return [
                f"Build on your existing {known}: complete a short diagnostic and write down 3 gaps to close.",
                f"Practice: {practice}. Focus on the parts that are new to you and save your work.",
                f"Build: create the first working version of {deliverables}.",
                "Verify: add at least 3 relevant tests or quality checks, then document setup and results in a README.",
            ]
        return [
            f"Learn: study {topics}. Use the linked free materials and write notes on 5 key concepts.",
            f"Practice: {practice}. Save your work and explain your decisions in your own words.",
            f"Build: create the first working version of {deliverables}.",
            "Verify: add at least 3 relevant tests or quality checks, then document setup and results in a README.",
        ]
    if occurrence == 1:
        return [
            f"Deepen: revisit {topics} and write down 3 edge cases or trade-offs.",
            f"Practice independently: {practice}. Complete the work without copying a tutorial solution.",
            f"Extend your project: add a second feature to {deliverables}.",
            "Review: test invalid and boundary cases, fix one issue, and record before/after evidence.",
        ]
    existing = f"Build on your existing {known}. " if known else ""
    return [
        f"Apply: {existing}complete a timed, independent exercise covering {topics}.",
        f"Integrate: finish and polish {deliverables}.",
        f"Quality check: demonstrate {practice} with tests, a short demo, or an analysis note.",
        "Present: update the README with screenshots or sample results, decisions, limitations, and next steps.",
    ]


def generate_roadmap(req: RoadmapRequest) -> RoadmapResponse:
    curriculum = _curriculum_for_role(req.target_role)
    priorities = list(dict.fromkeys(req.priority_order + req.missing_skills))
    plan = []
    prior_stage_groups = []

    for week in range(1, req.weeks + 1):
        stage_indices = _weeks_stages(week, req.weeks, len(curriculum))
        stages = [curriculum[index] for index in stage_indices]
        occurrence = prior_stage_groups.count(tuple(stage_indices))
        prior_stage_groups.append(tuple(stage_indices))

        focus_skills = list(dict.fromkeys(
            skill
            for stage in stages
            for skill in _stage_skills(stage, priorities)
        ))
        current_text = " ".join(req.current_skills).lower()
        known_skills = [
            skill
            for skill in dict.fromkeys(
                focus_skills + [skill for stage in stages for skill in stage["focus"]]
            )
            if re.search(r"\b" + re.escape(skill.lower()) + r"\b", current_text)
        ]
        objectives = [stage["objective"] for stage in stages]

        plan.append(
            WeekPlan(
                week=week,
                objective="; ".join(objectives),
                focus_skills=focus_skills,
                tasks=_weekly_tasks(stages, occurrence, known_skills),
                hours_per_week=req.hours_per_week,
                resources=resources_for_week(
                    focus_skills,
                    req.target_role,
                    [stage["study"] for stage in stages],
                ),
            )
        )

    return RoadmapResponse(
        target_role=req.target_role,
        total_weeks=req.weeks,
        plan=plan,
    )
