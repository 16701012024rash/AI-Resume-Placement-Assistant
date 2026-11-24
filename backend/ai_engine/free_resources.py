import re


_RESOURCES = [
    (("html", "css", "javascript", "web development"), {
        "title": "MDN Learn Web Development",
        "url": "https://developer.mozilla.org/en-US/docs/Learn_web_development",
        "description": "Free guided lessons for HTML, CSS, JavaScript, and browser fundamentals.",
    }),
    (("react",), {
        "title": "React: Learn",
        "url": "https://react.dev/learn",
        "description": "Free official React tutorial with hands-on examples.",
    }),
    (("typescript",), {
        "title": "TypeScript Handbook",
        "url": "https://www.typescriptlang.org/docs/handbook/intro.html",
        "description": "Free official guide to TypeScript types and everyday patterns.",
    }),
    (("accessibility", "a11y"), {
        "title": "W3C Web Accessibility Tutorials",
        "url": "https://www.w3.org/WAI/tutorials/",
        "description": "Free practical guidance for accessible websites and forms.",
    }),
    (("testing", "test automation"), {
        "title": "Testing Library: React",
        "url": "https://testing-library.com/docs/react-testing-library/intro/",
        "description": "Free documentation for testing React UI the way users interact with it.",
    }),
    (("python",), {
        "title": "CS50's Introduction to Programming with Python",
        "url": "https://cs50.harvard.edu/python/",
        "description": "Free Harvard course with lessons and programming exercises.",
    }),
    (("fastapi",), {
        "title": "FastAPI Tutorial",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "description": "Free official, step-by-step API development tutorial.",
    }),
    (("django",), {
        "title": "Django Getting Started",
        "url": "https://docs.djangoproject.com/en/stable/intro/",
        "description": "Free official tutorial for building a Django application.",
    }),
    (("node", "express"), {
        "title": "Node.js Learn",
        "url": "https://nodejs.org/en/learn",
        "description": "Free official guides for Node.js fundamentals and APIs.",
    }),
    (("sql", "database", "postgres"), {
        "title": "SQLBolt",
        "url": "https://sqlbolt.com/",
        "description": "Free interactive SQL lessons and exercises.",
    }),
    (("data analysis", "data analyst", "analytics", "pandas"), {
        "title": "Kaggle Learn",
        "url": "https://www.kaggle.com/learn",
        "description": "Free short courses and exercises in Python, pandas, SQL, and data topics.",
    }),
    (("pandas", "dataframe"), {
        "title": "pandas Getting Started Tutorials",
        "url": "https://pandas.pydata.org/docs/getting_started/intro_tutorials/",
        "description": "Free official tutorials for cleaning, transforming, and analyzing data.",
    }),
    (("excel", "spreadsheet"), {
        "title": "GCFGlobal Excel Tutorials",
        "url": "https://edu.gcfglobal.org/en/excel/",
        "description": "Free lessons on Excel formulas, charts, and data organization.",
    }),
    (("statistics", "probability"), {
        "title": "Khan Academy: Statistics and Probability",
        "url": "https://www.khanacademy.org/math/statistics-probability",
        "description": "Free lessons and practice covering core statistics and probability.",
    }),
    (("machine learning", "deep learning", "artificial intelligence", "ai engineer"), {
        "title": "Google Machine Learning Crash Course",
        "url": "https://developers.google.com/machine-learning/crash-course",
        "description": "Free lessons, visualizations, and exercises for machine learning basics.",
    }),
    (("pytorch", "neural network"), {
        "title": "PyTorch Tutorials",
        "url": "https://pytorch.org/tutorials/",
        "description": "Free official tutorials for building and training neural networks.",
    }),
    (("algorithm", "data structure", "dsa", "problem solving"), {
        "title": "Princeton Algorithms",
        "url": "https://algs4.cs.princeton.edu/home/",
        "description": "Free course materials, explanations, and exercises for algorithms.",
    }),
    (("system design", "architecture"), {
        "title": "System Design Primer",
        "url": "https://github.com/donnemartin/system-design-primer",
        "description": "Free open-source system design explanations and practice questions.",
    }),
    (("git", "github", "version control"), {
        "title": "GitHub Skills",
        "url": "https://skills.github.com/",
        "description": "Free, interactive Git and GitHub courses using practice repositories.",
    }),
    (("cloud", "aws", "azure"), {
        "title": "AWS Skill Builder",
        "url": "https://skillbuilder.aws/",
        "description": "Free digital training to learn cloud fundamentals and AWS services.",
    }),
    (("portfolio", "project"), {
        "title": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/",
        "description": "Free curricula with project-based practice across web and programming topics.",
    }),
]

_GENERAL_RESOURCES = [
    {
        "title": "GitHub Skills",
        "url": "https://skills.github.com/",
        "description": "Free practice for documenting and sharing project work with GitHub.",
    },
    {
        "title": "roadmap.sh",
        "url": "https://roadmap.sh/",
        "description": "Free community-maintained learning paths for technology roles.",
    },
]


def resources_for_week(focus_skills: list[str], target_role: str, tasks: list[str]) -> list[dict]:
    context = " ".join([target_role, *focus_skills, *tasks]).lower()
    resources = []
    seen_urls = set()

    for keywords, resource in _RESOURCES:
        if any(re.search(r"\b" + re.escape(keyword) + r"\b", context) for keyword in keywords):
            if resource["url"] not in seen_urls:
                resources.append(resource)
                seen_urls.add(resource["url"])
        if len(resources) == 4:
            break

    for resource in _GENERAL_RESOURCES:
        if len(resources) == 4:
            break
        if resource["url"] not in seen_urls:
            resources.append(resource)
            seen_urls.add(resource["url"])

    return resources
