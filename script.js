// script.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("script.js loaded"); // debug

  // ========= COUNTERS (for animated numbers) =========
  const counters = document.querySelectorAll("[data-counter]");

  if (!("IntersectionObserver" in window)) {
    counters.forEach((el) => runCounter(el));
  } else if (counters.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((el) => observer.observe(el));
  }

  // ========= TABLE / CHART TOGGLE (for statistics.html) =========
  const toggleButtons = document.querySelectorAll(".impact-toggle-btn");
  const panels = document.querySelectorAll("[data-impact-panel]");
  let chartAnimated = false;

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.impactView;
      console.log("switching to view:", view);

      // Active button styling
      toggleButtons.forEach((b) => b.classList.toggle("active", b === btn));

      // Show / hide panels using .hidden class
      panels.forEach((panel) => {
        const isTarget = panel.dataset.impactPanel === view;
        panel.classList.toggle("hidden", !isTarget);
      });

      // Animate chart bars the first time chart is opened
      if (view === "chart" && !chartAnimated) {
        animateImpactChart();
        chartAnimated = true;
      }
    });
  });
});

// ========= FUNCTIONS =========

// Counter animation
function runCounter(el) {
  const target = Number(el.dataset.target) || 0;
  const duration = Number(el.dataset.duration) || 1500;
  const prefix = el.dataset.prefix || "";
  const suffix = el.dataset.suffix || "";

  let start = null;

  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const value = Math.floor(progress * target);

    el.textContent = prefix + value.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}
// =========================================
// FLOOD PREPAREDNESS PLANNER + WEBMCP
// =========================================

document.addEventListener("DOMContentLoaded", () => {

  // Creates the actual personalized preparedness plan.
  function createPreparednessPlan(input) {
    const householdSize = Number(input.householdSize);
    const riskLevel = input.riskLevel;
    const areaType = input.areaType;
    const accessibilitySupport = input.accessibilitySupport;

    const plan = [];

    // Recommendations for every household
    plan.push(
      `Prepare essential supplies and emergency necessities for ${householdSize} household member${householdSize === 1 ? "" : "s"}.`
    );

    plan.push(
      "Keep important documents and emergency contact information in a safe, accessible place."
    );

    plan.push(
      "Discuss a family communication plan and agree on a safe meeting point."
    );

    // Recommendations based on risk level
    if (riskLevel === "high") {
      plan.push(
        "Monitor official weather and emergency updates closely and be prepared to follow instructions from local authorities."
      );
      plan.push(
        "Identify safe locations and review your family's emergency arrangements in advance."
      );
    } else if (riskLevel === "medium") {
      plan.push(
        "Check official weather information regularly and review your household preparedness plan."
      );
    } else {
      plan.push(
        "Stay informed about seasonal flood risks and review your preparedness plan periodically."
      );
    }

    // Recommendations based on area
    if (areaType === "urban") {
      plan.push(
        "Learn about local emergency information and be aware of drainage and flood-prone areas in your community."
      );
    } else if (areaType === "rural") {
      plan.push(
        "Plan how household members can communicate if roads or local services are temporarily disrupted."
      );
    } else if (areaType === "coastal") {
      plan.push(
        "Pay close attention to official weather alerts and understand the emergency procedures used in your community."
      );
    }

    // Accessibility considerations
    if (accessibilitySupport) {
      plan.push(
        "Make sure your household plan considers any additional mobility or communication needs and coordinate appropriate support in advance."
      );
    }

    return plan;
  }


  // Displays the plan on the actual website.
  function displayPlan(input) {
    const resultBox = document.getElementById("planResult");

    if (!resultBox) return [];

    const plan = createPreparednessPlan(input);

    resultBox.innerHTML = `
      <h3>Your Personalized Flood Preparedness Plan</h3>
      <p>Based on the information provided, consider the following steps:</p>
      <ul>
        ${plan.map(item => `<li>${item}</li>`).join("")}
      </ul>
    `;

    resultBox.classList.add("visible");

    return plan;
  }


  // Allows a normal human visitor to use the planner.
  const preparednessForm = document.getElementById("preparednessForm");

  if (preparednessForm) {
    preparednessForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const input = {
        householdSize: document.getElementById("householdSize").value,
        riskLevel: document.getElementById("riskLevel").value,
        areaType: document.getElementById("areaType").value,
        accessibilitySupport:
          document.getElementById("accessibilitySupport").checked
      };

      displayPlan(input);
    });
  }


  // =========================================
  // WEBMCP: EXPOSE THE PLANNER TO AI AGENTS
  // =========================================

  if (
    document.modelContext &&
    typeof document.modelContext.registerTool === "function"
  ) {

    document.modelContext.registerTool({

      name: "create_flood_preparedness_plan",

      description:
        "Create and display a personalized flood preparedness plan on the Floods in Pakistan website. Use this tool when a user wants help preparing their household for possible flooding.",

      inputSchema: {
        type: "object",

        properties: {
          householdSize: {
            type: "integer",
            description: "Number of people in the household.",
            minimum: 1,
            maximum: 20
          },

          riskLevel: {
            type: "string",
            description: "Estimated flood risk level.",
            enum: ["low", "medium", "high"]
          },

          areaType: {
            type: "string",
            description: "Type of area where the household is located.",
            enum: ["urban", "rural", "coastal"]
          },

          accessibilitySupport: {
            type: "boolean",
            description:
              "Whether someone in the household may need additional accessibility support."
          }
        },

        required: [
          "householdSize",
          "riskLevel",
          "areaType",
          "accessibilitySupport"
        ],

        additionalProperties: false
      },

      execute: async (input) => {

        // Update the visible website form so the human can
        // see exactly what the AI agent has done.
        document.getElementById("householdSize").value =
          input.householdSize;

        document.getElementById("riskLevel").value =
          input.riskLevel;

        document.getElementById("areaType").value =
          input.areaType;

        document.getElementById("accessibilitySupport").checked =
          input.accessibilitySupport;

        // Generate and display the plan on the website.
        const plan = displayPlan(input);

        // Return the result to the AI agent.
        return {
          success: true,
          message:
            "The personalized flood preparedness plan has been created and displayed on the website.",
          plan: plan
        };
      }

    })
    .then(() => {
      console.log("WebMCP Flood Preparedness tool registered successfully.");
    })
    .catch((error) => {
      console.error("WebMCP tool registration failed:", error);
    });

  } else {
    console.log(
      "WebMCP is not available in this browser. The planner will still work normally."
    );
  }

});
