import math
import os
import random
import sqlite3
from datetime import datetime, timedelta

from flask import Flask, g, redirect, render_template, request, url_for

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "harmonogram.db")

# Dozwolone wagi czasowe tras (w "dniówkach"). Im wyższa waga, tym dłużej
# trasa trwa (może wchodzić w kolejny dzień kalendarzowy), więc po jej
# wykonaniu przydzielamy odpowiednią liczbę dni odpoczynku.
SHIFT_WEIGHTS = [0.5, 1.0, 1.5, 2.0, 2.5]

# Statusy nieobecności, jakie można nadać pracownikowi na dany dzień.
ABSENCE_REASONS = {
    "odpoczynek": "Odpoczynek",
    "urlop": "Urlop",
    "l4": "L4",
}


def rest_days_for_weight(weight):
    """Liczba dni odpoczynku wymaganych po trasie o danej wadze.

    0.5 i 1 dniówka -> 0 dni odpoczynku (normalna, jednodniowa trasa)
    1.5 dniówki -> 1 dzień odpoczynku
    2 dniówki -> 1 dzień odpoczynku
    2.5 dniówki -> 2 dni odpoczynku
    """
    return max(0, math.floor(weight - 0.5))

app = Flask(__name__)


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


@app.teardown_appcontext
def close_db(exception=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = sqlite3.connect(DB_PATH)
    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS unavailability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            reason TEXT NOT NULL DEFAULT 'urlop',
            UNIQUE(employee_id, date)
        );

        CREATE TABLE IF NOT EXISTS shift_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            people_needed INTEGER NOT NULL DEFAULT 1,
            weight REAL NOT NULL DEFAULT 1.0,
            order_index INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS schedules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            schedule_id INTEGER NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
            date TEXT NOT NULL,
            shift_type_id INTEGER NOT NULL REFERENCES shift_types(id) ON DELETE CASCADE,
            slot INTEGER NOT NULL DEFAULT 0,
            employee_id INTEGER REFERENCES employees(id) ON DELETE SET NULL
        );
        """
    )
    shift_columns = {
        row[1] for row in db.execute("PRAGMA table_info(shift_types)").fetchall()
    }
    if "weight" not in shift_columns:
        db.execute(
            "ALTER TABLE shift_types ADD COLUMN weight REAL NOT NULL DEFAULT 1.0"
        )
    unavailability_columns = {
        row[1] for row in db.execute("PRAGMA table_info(unavailability)").fetchall()
    }
    if "reason" not in unavailability_columns:
        db.execute(
            "ALTER TABLE unavailability ADD COLUMN reason TEXT NOT NULL DEFAULT 'urlop'"
        )
    db.commit()
    db.close()


def daterange(start_date, end_date):
    days = (end_date - start_date).days
    for i in range(days + 1):
        yield start_date + timedelta(days=i)


def generate_assignments(db, start_date, end_date, employees, shift_types, unavailable_map):
    """Fairly and randomly assign employees to shifts across the date range.

    Each day, a person can work at most one shift. Assignment prefers whoever
    has worked the fewest shifts so far in this schedule, with ties broken
    randomly, so the workload spreads out evenly instead of clustering.

    Trasy o wadze większej niż 1 dniówka (1.5/2/2.5) automatycznie blokują
    danej osobie kolejne dni jako odpoczynek — liczbę dni wyznacza
    rest_days_for_weight na podstawie wagi trasy.
    """
    assign_counts = {e["id"]: 0 for e in employees}
    resting_until = {}  # employee_id -> ostatni dzień (date), do którego trwa odpoczynek
    results = []

    for day in daterange(start_date, end_date):
        day_str = day.isoformat()
        used_today = set()

        def is_resting(emp_id, day=day):
            until = resting_until.get(emp_id)
            return until is not None and until >= day

        for shift in shift_types:
            for slot in range(shift["people_needed"]):
                candidates = [
                    e
                    for e in employees
                    if e["id"] not in used_today
                    and day_str not in unavailable_map.get(e["id"], set())
                    and not is_resting(e["id"])
                ]
                if not candidates:
                    results.append((day_str, shift["id"], slot, None))
                    continue
                min_count = min(assign_counts[e["id"]] for e in candidates)
                best = [e for e in candidates if assign_counts[e["id"]] == min_count]
                chosen = random.choice(best)
                results.append((day_str, shift["id"], slot, chosen["id"]))
                assign_counts[chosen["id"]] += 1
                used_today.add(chosen["id"])

                rest_days = rest_days_for_weight(shift["weight"])
                if rest_days > 0:
                    resting_until[chosen["id"]] = day + timedelta(days=rest_days)

    return results


def load_unavailable_map(db):
    unavailable_map = {}
    for row in db.execute("SELECT employee_id, date FROM unavailability").fetchall():
        unavailable_map.setdefault(row["employee_id"], set()).add(row["date"])
    return unavailable_map


def repair_schedule(db, schedule, from_date, locked_ids=()):
    """Sprawdza kolizje w harmonogramie od dnia `from_date` i podmienia
    tylko te przydziały, które łamią reguły.

    Dni przed `from_date` zostają zamrożone (ale nadal liczą się do
    sprawiedliwości i odpoczynku po ciężkich trasach). Przydziały z
    `locked_ids` (ręcznie wybrane przez użytkownika) są traktowane jako
    ostateczne i to inne komórki muszą się do nich dostosować.
    Zwraca liczbę zmienionych przydziałów.
    """
    employees = db.execute(
        "SELECT * FROM employees WHERE active = 1 ORDER BY name"
    ).fetchall()
    active_ids = {e["id"] for e in employees}
    unavailable_map = load_unavailable_map(db)
    locked_ids = set(locked_ids)

    rows = db.execute(
        "SELECT a.id, a.date, a.shift_type_id, a.slot, a.employee_id, s.weight "
        "FROM assignments a JOIN shift_types s ON s.id = a.shift_type_id "
        "WHERE a.schedule_id = ? ORDER BY a.date, s.order_index, a.slot",
        (schedule["id"],),
    ).fetchall()
    by_day = {}
    for r in rows:
        by_day.setdefault(r["date"], []).append(r)

    start_date = datetime.strptime(schedule["start_date"], "%Y-%m-%d").date()
    end_date = datetime.strptime(schedule["end_date"], "%Y-%m-%d").date()

    assign_counts = {e["id"]: 0 for e in employees}
    resting_until = {}
    changed = 0

    def accept(emp_id, weight, day):
        if emp_id is None:
            return
        assign_counts[emp_id] = assign_counts.get(emp_id, 0) + 1
        rest_days = rest_days_for_weight(weight)
        if rest_days > 0:
            resting_until[emp_id] = day + timedelta(days=rest_days)

    for day in daterange(start_date, end_date):
        day_str = day.isoformat()
        used_today = set()
        frozen = day < from_date
        # Ręcznie wybrane komórki rozpatrujemy pierwsze, żeby reszta dnia
        # ustąpiła im miejsca, a nie odwrotnie.
        todays = sorted(by_day.get(day_str, []), key=lambda r: r["id"] not in locked_ids)

        def is_resting(emp_id):
            until = resting_until.get(emp_id)
            return until is not None and until >= day

        for a in todays:
            emp = a["employee_id"]
            if frozen or a["id"] in locked_ids:
                if emp is not None:
                    used_today.add(emp)
                    accept(emp, a["weight"], day)
                continue

            valid = (
                emp is not None
                and emp in active_ids
                and emp not in used_today
                and day_str not in unavailable_map.get(emp, set())
                and not is_resting(emp)
            )
            if not valid:
                candidates = [
                    e
                    for e in employees
                    if e["id"] not in used_today
                    and day_str not in unavailable_map.get(e["id"], set())
                    and not is_resting(e["id"])
                ]
                if candidates:
                    min_count = min(assign_counts[e["id"]] for e in candidates)
                    best = [e for e in candidates if assign_counts[e["id"]] == min_count]
                    emp = random.choice(best)["id"]
                else:
                    emp = None
                if emp != a["employee_id"]:
                    db.execute(
                        "UPDATE assignments SET employee_id = ? WHERE id = ?",
                        (emp, a["id"]),
                    )
                    changed += 1

            if emp is not None:
                used_today.add(emp)
                accept(emp, a["weight"], day)

    return changed


@app.route("/")
def index():
    return redirect(url_for("list_schedules"))


# ---------- Pracownicy ----------

@app.route("/pracownicy", methods=["GET", "POST"])
def employees():
    db = get_db()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        if name:
            db.execute("INSERT INTO employees (name, active) VALUES (?, 1)", (name,))
            db.commit()
        return redirect(url_for("employees"))

    people = db.execute("SELECT * FROM employees ORDER BY name").fetchall()
    unavailability = db.execute(
        "SELECT id, employee_id, date, reason FROM unavailability ORDER BY date"
    ).fetchall()
    unavail_by_emp = {}
    for row in unavailability:
        unavail_by_emp.setdefault(row["employee_id"], []).append(
            {
                "id": row["id"],
                "date": row["date"],
                "reason": row["reason"],
                "reason_label": ABSENCE_REASONS.get(row["reason"], row["reason"]),
            }
        )

    return render_template(
        "employees.html",
        employees=people,
        unavail_by_emp=unavail_by_emp,
        reasons=ABSENCE_REASONS,
    )


@app.route("/pracownicy/<int:employee_id>/usun", methods=["POST"])
def delete_employee(employee_id):
    db = get_db()
    db.execute("DELETE FROM employees WHERE id = ?", (employee_id,))
    db.commit()
    return redirect(url_for("employees"))


@app.route("/pracownicy/<int:employee_id>/aktywnosc", methods=["POST"])
def toggle_employee(employee_id):
    db = get_db()
    db.execute(
        "UPDATE employees SET active = 1 - active WHERE id = ?", (employee_id,)
    )
    db.commit()
    return redirect(url_for("employees"))


@app.route("/pracownicy/<int:employee_id>/niedostepnosc", methods=["POST"])
def add_unavailability(employee_id):
    db = get_db()
    date_str = request.form.get("date", "").strip()
    reason = request.form.get("reason", "urlop").strip().lower()
    if reason not in ABSENCE_REASONS:
        reason = "urlop"
    if date_str:
        try:
            datetime.strptime(date_str, "%Y-%m-%d")
            db.execute(
                "INSERT INTO unavailability (employee_id, date, reason) VALUES (?, ?, ?) "
                "ON CONFLICT(employee_id, date) DO UPDATE SET reason = excluded.reason",
                (employee_id, date_str, reason),
            )
            db.commit()
        except ValueError:
            pass
    return redirect(url_for("employees"))


@app.route("/niedostepnosc/<int:row_id>/usun", methods=["POST"])
def delete_unavailability(row_id):
    db = get_db()
    db.execute("DELETE FROM unavailability WHERE id = ?", (row_id,))
    db.commit()
    return redirect(url_for("employees"))


# ---------- Typy zmian ----------

@app.route("/zmiany", methods=["GET", "POST"])
def shift_types():
    db = get_db()
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        people_needed = request.form.get("people_needed", "1").strip()
        weight = request.form.get("weight", "1.0").strip()
        try:
            people_needed = max(1, int(people_needed))
        except ValueError:
            people_needed = 1
        try:
            weight = float(weight)
        except ValueError:
            weight = 1.0
        if weight not in SHIFT_WEIGHTS:
            weight = min(SHIFT_WEIGHTS, key=lambda w: abs(w - weight))
        if name:
            max_order = db.execute(
                "SELECT COALESCE(MAX(order_index), -1) AS m FROM shift_types"
            ).fetchone()["m"]
            db.execute(
                "INSERT INTO shift_types (name, people_needed, weight, order_index) "
                "VALUES (?, ?, ?, ?)",
                (name, people_needed, weight, max_order + 1),
            )
            db.commit()
        return redirect(url_for("shift_types"))

    types = db.execute("SELECT * FROM shift_types ORDER BY order_index").fetchall()
    rest_days = {t["id"]: rest_days_for_weight(t["weight"]) for t in types}
    return render_template(
        "shift_types.html", shift_types=types, weights=SHIFT_WEIGHTS, rest_days=rest_days
    )


@app.route("/zmiany/<int:shift_id>/usun", methods=["POST"])
def delete_shift_type(shift_id):
    db = get_db()
    db.execute("DELETE FROM shift_types WHERE id = ?", (shift_id,))
    db.commit()
    return redirect(url_for("shift_types"))


# ---------- Harmonogramy ----------

@app.route("/harmonogramy")
def list_schedules():
    db = get_db()
    schedules = db.execute(
        "SELECT * FROM schedules ORDER BY created_at DESC"
    ).fetchall()
    return render_template("schedules.html", schedules=schedules)


@app.route("/harmonogramy/nowy", methods=["GET", "POST"])
def new_schedule():
    db = get_db()
    if request.method == "POST":
        name = request.form.get("name", "").strip() or "Harmonogram"
        start_str = request.form.get("start_date")
        end_str = request.form.get("end_date")

        try:
            start_date = datetime.strptime(start_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return redirect(url_for("new_schedule"))

        if end_date < start_date:
            start_date, end_date = end_date, start_date

        employees = db.execute(
            "SELECT * FROM employees WHERE active = 1 ORDER BY name"
        ).fetchall()
        shift_types_rows = db.execute(
            "SELECT * FROM shift_types ORDER BY order_index"
        ).fetchall()

        if not employees or not shift_types_rows:
            return redirect(url_for("new_schedule"))

        unavailable_map = load_unavailable_map(db)

        cur = db.execute(
            "INSERT INTO schedules (name, start_date, end_date, created_at) VALUES (?, ?, ?, ?)",
            (name, start_date.isoformat(), end_date.isoformat(), datetime.now().isoformat()),
        )
        schedule_id = cur.lastrowid

        assignments = generate_assignments(
            db, start_date, end_date, employees, shift_types_rows, unavailable_map
        )
        db.executemany(
            "INSERT INTO assignments (schedule_id, date, shift_type_id, slot, employee_id) "
            "VALUES (?, ?, ?, ?, ?)",
            [(schedule_id, d, s, slot, e) for d, s, slot, e in assignments],
        )
        db.commit()

        return redirect(url_for("view_schedule", schedule_id=schedule_id))

    employees = db.execute(
        "SELECT * FROM employees WHERE active = 1 ORDER BY name"
    ).fetchall()
    shift_types_rows = db.execute(
        "SELECT * FROM shift_types ORDER BY order_index"
    ).fetchall()
    today = datetime.now().date().isoformat()
    return render_template(
        "new_schedule.html",
        employees=employees,
        shift_types=shift_types_rows,
        today=today,
    )


def _load_schedule_view(db, schedule_id):
    schedule = db.execute(
        "SELECT * FROM schedules WHERE id = ?", (schedule_id,)
    ).fetchone()
    if schedule is None:
        return None, None, None, None

    shift_types_rows = db.execute(
        "SELECT * FROM shift_types ORDER BY order_index"
    ).fetchall()
    all_employees = db.execute("SELECT * FROM employees ORDER BY name").fetchall()

    assignments = db.execute(
        "SELECT * FROM assignments WHERE schedule_id = ? ORDER BY date, shift_type_id, slot",
        (schedule_id,),
    ).fetchall()

    start_date = datetime.strptime(schedule["start_date"], "%Y-%m-%d").date()
    end_date = datetime.strptime(schedule["end_date"], "%Y-%m-%d").date()
    days = [d.isoformat() for d in daterange(start_date, end_date)]

    grid = {}
    for a in assignments:
        grid.setdefault(a["date"], {}).setdefault(a["shift_type_id"], []).append(a)

    return schedule, shift_types_rows, all_employees, {"days": days, "grid": grid}


@app.route("/harmonogramy/<int:schedule_id>")
def view_schedule(schedule_id):
    db = get_db()
    schedule, shift_types_rows, all_employees, table = _load_schedule_view(
        db, schedule_id
    )
    if schedule is None:
        return redirect(url_for("list_schedules"))

    return render_template(
        "schedule_view.html",
        schedule=schedule,
        shift_types=shift_types_rows,
        employees=all_employees,
        days=table["days"],
        grid=table["grid"],
    )


@app.route("/harmonogramy/<int:schedule_id>/losuj-ponownie", methods=["POST"])
def reroll_schedule(schedule_id):
    db = get_db()
    schedule = db.execute(
        "SELECT * FROM schedules WHERE id = ?", (schedule_id,)
    ).fetchone()
    if schedule is None:
        return redirect(url_for("list_schedules"))

    employees = db.execute(
        "SELECT * FROM employees WHERE active = 1 ORDER BY name"
    ).fetchall()
    shift_types_rows = db.execute(
        "SELECT * FROM shift_types ORDER BY order_index"
    ).fetchall()
    unavailable_map = load_unavailable_map(db)

    start_date = datetime.strptime(schedule["start_date"], "%Y-%m-%d").date()
    end_date = datetime.strptime(schedule["end_date"], "%Y-%m-%d").date()

    db.execute("DELETE FROM assignments WHERE schedule_id = ?", (schedule_id,))
    assignments = generate_assignments(
        db, start_date, end_date, employees, shift_types_rows, unavailable_map
    )
    db.executemany(
        "INSERT INTO assignments (schedule_id, date, shift_type_id, slot, employee_id) "
        "VALUES (?, ?, ?, ?, ?)",
        [(schedule_id, d, s, slot, e) for d, s, slot, e in assignments],
    )
    db.commit()
    return redirect(url_for("view_schedule", schedule_id=schedule_id))


@app.route("/harmonogramy/<int:schedule_id>/przypisanie/<int:assignment_id>", methods=["POST"])
def update_assignment(schedule_id, assignment_id):
    db = get_db()
    schedule = db.execute(
        "SELECT * FROM schedules WHERE id = ?", (schedule_id,)
    ).fetchone()
    assignment = db.execute(
        "SELECT * FROM assignments WHERE id = ? AND schedule_id = ?",
        (assignment_id, schedule_id),
    ).fetchone()
    if schedule is None or assignment is None:
        return redirect(url_for("list_schedules"))

    employee_id = request.form.get("employee_id") or None
    db.execute(
        "UPDATE assignments SET employee_id = ? WHERE id = ?",
        (employee_id, assignment_id),
    )
    from_date = datetime.strptime(assignment["date"], "%Y-%m-%d").date()
    changed = repair_schedule(db, schedule, from_date, locked_ids={assignment_id})
    db.commit()
    return redirect(
        url_for(
            "view_schedule",
            schedule_id=schedule_id,
            naprawiono=changed,
            od=assignment["date"],
        )
    )


@app.route("/harmonogramy/<int:schedule_id>/napraw", methods=["POST"])
def repair_schedule_view(schedule_id):
    db = get_db()
    schedule = db.execute(
        "SELECT * FROM schedules WHERE id = ?", (schedule_id,)
    ).fetchone()
    if schedule is None:
        return redirect(url_for("list_schedules"))

    from_str = request.form.get("from_date", "").strip() or schedule["start_date"]
    try:
        from_date = datetime.strptime(from_str, "%Y-%m-%d").date()
    except ValueError:
        from_date = datetime.strptime(schedule["start_date"], "%Y-%m-%d").date()

    changed = repair_schedule(db, schedule, from_date)
    db.commit()
    return redirect(
        url_for(
            "view_schedule",
            schedule_id=schedule_id,
            naprawiono=changed,
            od=from_date.isoformat(),
        )
    )


@app.route("/harmonogramy/<int:schedule_id>/usun", methods=["POST"])
def delete_schedule(schedule_id):
    db = get_db()
    db.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
    db.commit()
    return redirect(url_for("list_schedules"))


def seed_default_data():
    """Wgrywa startowy zestaw pracowników i typów tras na podstawie realnych
    harmonogramów przeanalizowanych w tej rozmowie. Uruchamia się tylko raz —
    jeśli tabela pracowników jest pusta (czyli przy pierwszym starcie na
    świeżej bazie, np. po wdrożeniu na Render)."""
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    already_seeded = db.execute("SELECT COUNT(*) AS c FROM employees").fetchone()["c"]
    if already_seeded:
        db.close()
        return

    employees = [
        "Jacek Schmidt",
        "Roman Wranik",
        "Krzysztof Misiewicz",
        "Andrzej Czogała",
        "Tomasz Twardzik",
        "Grzegorz Knura",
        "Stanisław Piórkowski",
        "Tomasz Bubon",
    ]
    db.executemany(
        "INSERT INTO employees (name, active) VALUES (?, 1)",
        [(name,) for name in employees],
    )

    # Wagi tras odtworzone z legendy i wzorca "dzień wolny przed/po dłuższej
    # trasie" widocznego w prawdziwych harmonogramach. Każdą wagę można
    # później zmienić w aplikacji (strona "Typy zmian").
    shift_types = [
        ("Trasa 1", 1.0),
        ("Trasa 2", 1.0),
        ("Trasa 3", 1.0),
        ("Trasa 4", 1.0),
        ("Trasa 5", 1.0),
        ("Trasa 6", 1.0),
        ("Trasa 7", 1.0),
        ("Trasa 8", 2.5),
        ("Trasa 9", 2.5),
        ("Trasa 10", 2.5),
        ("Trasa 11", 2.5),
        ("Nagel", 0.5),
        ("Zwroty", 1.0),
    ]
    db.executemany(
        "INSERT INTO shift_types (name, people_needed, weight, order_index) "
        "VALUES (?, 1, ?, ?)",
        [(name, weight, i) for i, (name, weight) in enumerate(shift_types)],
    )

    db.commit()
    db.close()


init_db()
seed_default_data()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
