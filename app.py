from flask import Flask, render_template, request, jsonify
import random
import math

app = Flask(__name__)


# -----------------------------
# HOME PAGE
# -----------------------------
@app.route("/")
def home():
    return render_template("index.html")


# -----------------------------
# ROUTE CALCULATION
# -----------------------------
@app.route("/api/routes", methods=["POST"])
def get_routes():

    data = request.get_json()

    destination = data.get("destination", "Unknown")
    transport = data.get("transport", "car")

    # Simulated route information
    routes = [
        {
            "name": "Route A",
            "distance": round(random.uniform(4.5, 7.5), 1),
            "traffic": random.choice(["Low", "Medium", "High"]),
            "road": "Main Road"
        },
        {
            "name": "Route B",
            "distance": round(random.uniform(5.0, 8.5), 1),
            "traffic": random.choice(["Low", "Medium", "High"]),
            "road": "Ring Road"
        },
        {
            "name": "Route C",
            "distance": round(random.uniform(3.5, 6.5), 1),
            "traffic": random.choice(["Low", "Medium", "High"]),
            "road": "City Road"
        }
    ]

    # Average speeds
    speeds = {
        "car": 35,
        "bus": 25,
        "bike": 30,
        "walk": 5
    }

    speed = speeds.get(transport, 30)

    # Traffic multipliers
    traffic_factor = {
        "Low": 1.0,
        "Medium": 1.3,
        "High": 1.7
    }

    # Calculate ETA
    for route in routes:

        base_time = (route["distance"] / speed) * 60

        eta = base_time * traffic_factor[route["traffic"]]

        route["eta"] = round(eta)

        route["delay"] = round(eta - base_time)

        # AI-style score
        traffic_score = {
            "Low": 1,
            "Medium": 5,
            "High": 10
        }

        route["score"] = (
            route["eta"]
            + route["distance"]
            + traffic_score[route["traffic"]]
        )

    # Select lowest score
    best_route = min(routes, key=lambda x: x["score"])

    for route in routes:
        route["recommended"] = (
            route["name"] == best_route["name"]
        )

    return jsonify({
        "destination": destination,
        "transport": transport,
        "routes": routes,
        "recommended": best_route["name"]
    })


# -----------------------------
# TRAFFIC DATA
# -----------------------------
@app.route("/api/traffic")
def traffic():

    data = [
        {
            "road": "Main Road",
            "traffic": random.choice(
                ["Low", "Medium", "High"]
            )
        },
        {
            "road": "Ring Road",
            "traffic": random.choice(
                ["Low", "Medium", "High"]
            )
        },
        {
            "road": "City Center",
            "traffic": random.choice(
                ["Low", "Medium", "High"]
            )
        },
        {
            "road": "Bus Stand Road",
            "traffic": random.choice(
                ["Low", "Medium", "High"]
            )
        }
    ]

    return jsonify(data)


# -----------------------------
# REPORT SYSTEM
# -----------------------------
reports = []


@app.route("/api/report", methods=["POST"])
def report():

    data = request.get_json()

    report = {
        "type": data.get("type"),
        "location": data.get("location"),
        "description": data.get("description")
    }

    reports.append(report)

    return jsonify({
        "success": True,
        "message": "Report submitted successfully!"
    })


# -----------------------------
# GET REPORTS
# -----------------------------
@app.route("/api/reports")
def get_reports():

    return jsonify(reports)


# -----------------------------
# BUS INFORMATION
# -----------------------------
@app.route("/api/buses")
def buses():

    buses = [
        {
            "number": "BUS-101",
            "route": "City Center → Railway Station",
            "eta": random.randint(3, 15),
            "status": "On Time"
        },
        {
            "number": "BUS-204",
            "route": "College Road → Bus Stand",
            "eta": random.randint(5, 20),
            "status": "Delayed"
        },
        {
            "number": "BUS-305",
            "route": "Market → Railway Station",
            "eta": random.randint(2, 12),
            "status": "On Time"
        }
    ]

    return jsonify(buses)


if __name__ == "__main__":
    app.run(debug=True)
