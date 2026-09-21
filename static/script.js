// -------------------------------------
// NAVIGATION
// -------------------------------------

function showSection(sectionName) {

    const sections =
        document.querySelectorAll(".section");

    sections.forEach(section => {

        section.classList.remove("active");

    });

    document
        .getElementById(sectionName)
        .classList.add("active");

}


// -------------------------------------
// FIND ROUTES
// -------------------------------------

async function findRoutes() {

    const destination =
        document
            .getElementById("destination")
            .value;

    const transport =
        document
            .getElementById("transport")
            .value;


    if (!destination) {

        alert("Please enter a destination.");

        return;
    }


    showSection("routes");


    const resultBox =
        document
            .getElementById("routeResults");


    resultBox.innerHTML =
        "<p class='empty'>🤖 AI analyzing traffic...</p>";


    try {

        const response =
            await fetch("/api/routes", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    destination:
                        destination,

                    transport:
                        transport

                })

            });


        const data =
            await response.json();


        resultBox.innerHTML = "";


        data.routes.forEach(route => {

            const trafficClass =
                route.traffic
                    .toLowerCase();


            const card =
                document.createElement("div");


            card.className =
                "route-card " +
                (route.recommended
                    ? "recommended"
                    : "");


            card.innerHTML = `

                ${
                    route.recommended

                    ?

                    `<span class="recommended-label">
                        ⭐ AI Recommended
                    </span>`

                    :

                    ""
                }

                <h3>
                    ${route.name}
                </h3>

                <p>
                    📍 ${route.road}
                </p>

                <div class="route-info">

                    <div>
                        <strong>
                            ${route.eta} min
                        </strong>
                        <small>ETA</small>
                    </div>

                    <div>
                        <strong>
                            ${route.distance} km
                        </strong>
                        <small>Distance</small>
                    </div>

                    <div>
                        <strong
                            class="${trafficClass}">
                            ${route.traffic}
                        </strong>
                        <small>Traffic</small>
                    </div>

                </div>

                <p style="margin-top:12px">
                    ⏱️ Estimated delay:
                    ${route.delay} min
                </p>
            `;


            resultBox.appendChild(card);

        });


        createMap();

    }

    catch(error) {

        console.error(error);

        resultBox.innerHTML =
            "<p class='empty'>Unable to load routes.</p>";
    }
}


// -------------------------------------
// MAP
// -------------------------------------

let map;


function createMap() {

    if (map) {

        map.remove();

    }


    map =
        L.map("map")
            .setView(
                [14.6819, 77.6006],
                13
            );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "© OpenStreetMap contributors"
        }
    ).addTo(map);


    // Example route line

    const routePoints = [

        [14.6819, 77.6006],

        [14.6900, 77.6100],

        [14.7000, 77.6200]

    ];


    L.polyline(
        routePoints,
        {
            weight: 6
        }
    ).addTo(map);


    L.marker(
        [14.6819, 77.6006]
    )
        .addTo(map)
        .bindPopup("📍 Current Location");


    L.marker(
        [14.7000, 77.6200]
    )
        .addTo(map)
        .bindPopup("🎯 Destination");

}


// -------------------------------------
// LOAD BUSES
// -------------------------------------

async function loadBuses() {

    const result =
        document
            .getElementById("busResults");


    result.innerHTML =
        "<p class='empty'>Loading buses...</p>";


    const response =
        await fetch("/api/buses");


    const buses =
        await response.json();


    result.innerHTML = "";


    buses.forEach(bus => {

        const card =
            document.createElement("div");


        card.className =
            "bus-card";


        card.innerHTML = `

            <h3>
                🚌 ${bus.number}
            </h3>

            <p>
                ${bus.route}
            </p>

            <br>

            <strong>
                Arriving in ${bus.eta} minutes
            </strong>

            <p>
                Status:
                ${bus.status}
            </p>

        `;


        result.appendChild(card);

    });

}

// ------------------------------------
// SEARCH BUSES
// ------------------------------------

async function searchBuses() {

    const from = document
        .getElementById("busFrom")
        .value
        .trim()
        .toLowerCase();

    const to = document
        .getElementById("busTo")
        .value
        .trim()
        .toLowerCase();

    const result = document.getElementById("busResults");

    // Check whether both fields are filled
    if (!from || !to) {

        result.innerHTML =
            "<p class='empty'>Please enter both From and To locations.</p>";

        return;
    }

    result.innerHTML =
        "<p class='empty'>Searching buses...</p>";

    try {

        const response = await fetch("/api/buses");

        const buses = await response.json();

        // Filter buses according to route
        const matchingBuses = buses.filter(bus => {

            const route =
                String(bus.route || "").toLowerCase();

            return route.includes(from) &&
                   route.includes(to);
        });

        // No buses found
        if (matchingBuses.length === 0) {

            result.innerHTML = `
                <p class="empty">
                    No buses found from
                    <strong>${from}</strong>
                    to
                    <strong>${to}</strong>.
                </p>
            `;

            return;
        }

        // Clear old results
        result.innerHTML = "";

        // Display matching buses
        matchingBuses.forEach(bus => {

            const card =
                document.createElement("div");

            card.className = "bus-card";

            card.innerHTML = `

                <h3>
                    🚌 ${bus.number}
                </h3>

                <p>
                    ${bus.route}
                </p>

                <strong>
                    Arriving in ${bus.eta} minutes
                </strong>

                <p>
                    Status:
                    ${bus.status}
                </p>

            `;

            result.appendChild(card);

        });

    } catch (error) {

        console.error("Bus search error:", error);

        result.innerHTML =
            "<p class='empty'>Unable to load bus information.</p>";
    }
}



// -------------------------------------
// SUBMIT REPORT
// -------------------------------------

async function submitReport() {

    const type =
        document
            .getElementById("reportType")
            .value;


    const location =
        document
            .getElementById("reportLocation")
            .value;


    const description =
        document
            .getElementById("reportDescription")
            .value;


    if (!location) {

        alert("Please enter the location.");

        return;
    }


    const response =
        await fetch("/api/report", {

            method: "POST",

            headers: {

                "Content-Type":
                    "application/json"

            },

            body: JSON.stringify({

                type: type,

                location: location,

                description: description

            })

        });


    const data =
        await response.json();


    document
        .getElementById("reportMessage")
        .innerHTML = `

        <div class="route-card">

            ✅ ${data.message}

        </div>

    `;


    document
        .getElementById("reportLocation")
        .value = "";


    document
        .getElementById("reportDescription")
        .value = "";

}


// -------------------------------------
// TRAFFIC DASHBOARD
// -------------------------------------

async function loadTraffic() {

    const result =
        document
            .getElementById("trafficResults");


    result.innerHTML =
        "<p class='empty'>Analyzing traffic...</p>";


    const response =
        await fetch("/api/traffic");


    const data =
        await response.json();


    result.innerHTML = "";


    data.forEach(item => {

        const trafficClass =
            item.traffic
                .toLowerCase();


        const card =
            document.createElement("div");


        card.className =
            "traffic-card";


        card.innerHTML = `

            <strong>
                🛣️ ${item.road}
            </strong>

            <span class="${trafficClass}">
                ${item.traffic}
            </span>

        `;


        result.appendChild(card);

    });

}


// ---------------------------------
// SEARCH ROUTES
// ---------------------------------

async function searchRoutes() {

    const from = document
        .getElementById("routeFrom")
        .value
        .trim();

    const to = document
        .getElementById("routeTo")
        .value
        .trim();

    const result =
        document.getElementById("routeResults");

    if (!from || !to) {

        result.innerHTML =
            "<p class='empty'>Please enter both From and To locations.</p>";

        return;
    }

    result.innerHTML =
        "<p class='empty'>Finding routes...</p>";

    try {

        const response = await fetch("/api/routes", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                from: from,
                to: to
            })
        });

        const routes = await response.json();

        result.innerHTML = "";

        routes.forEach(route => {

            const card =
                document.createElement("div");

            card.className = "route-card";

            card.innerHTML = `
                <h3>${route.name}</h3>

                <p>
                    <strong>From:</strong>
                    ${route.from}
                </p>

                <p>
                    <strong>To:</strong>
                    ${route.to}
                </p>

                <p>
                    <strong>Road:</strong>
                    ${route.road}
                </p>

                <p>
                    <strong>Distance:</strong>
                    ${route.distance} km
                </p>

                <p>
                    <strong>Traffic:</strong>
                    ${route.traffic}
                </p>
            `;

            result.appendChild(card);

        });

    } catch (error) {

        result.innerHTML =
            "<p class='empty'>Unable to find routes. Please try again.</p>";

        console.error(error);
    }
}