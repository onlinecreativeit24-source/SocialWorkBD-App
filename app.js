document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // =========================
  // Storage Helpers
  // =========================

  function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "[]");
  }

  function getJobs() {
    return JSON.parse(localStorage.getItem("jobs") || "[]");
  }

  function getBids() {
    return JSON.parse(localStorage.getItem("bids") || "[]");
  }

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  }

  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  function saveJobs(jobs) {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }

  function saveBids(bids) {
    localStorage.setItem("bids", JSON.stringify(bids));
  }

  function isLoggedIn() {
    return !!getCurrentUser();
  }

  function requireLogin() {
    if (!isLoggedIn()) {
      alert("এই কাজটি করতে আগে লগইন করুন।");
      window.location.href = "login.html";
      return false;
    }

    return true;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // =========================
  // SIGNUP
  // =========================

  if (path.includes("signup.html")) {
    const form = document.getElementById("signup-form");
    const role = document.getElementById("role");
    const skillsBox = document.getElementById("skills-box");
    const skillsInput = document.getElementById("skills");

    function updateSkills() {
      if (!role || !skillsBox || !skillsInput) return;

      if (role.value === "worker") {
        skillsBox.style.display = "block";
        skillsInput.required = true;
      } else {
        skillsBox.style.display = "none";
        skillsInput.required = false;
        skillsInput.value = "";
      }
    }

    if (role) {
      role.addEventListener("change", updateSkills);
      updateSkills();
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document
          .getElementById("email")
          .value.trim()
          .toLowerCase();

        const password = document.getElementById("password").value;
        const selectedRole = role.value;
        const skills = skillsInput
          ? skillsInput.value.trim()
          : "";

        if (!name) {
          alert("আপনার নাম দিন।");
          return;
        }

        if (password.length < 6) {
          alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
          return;
        }

        if (!selectedRole) {
          alert("Client অথবা Worker নির্বাচন করুন।");
          return;
        }

        if (selectedRole === "worker" && !skills) {
          alert("Worker হিসেবে আপনার স্কিল লিখুন।");
          return;
        }

        const users = getUsers();

        const exists = users.some(
          (user) => user.email === email
        );

        if (exists) {
          alert("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।");
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password,
          role: selectedRole,
          skills,
          balance: 0,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        alert("সাইনআপ সফল হয়েছে। এখন লগইন করুন।");

        window.location.href = "login.html";
      });
    }
  }

  // =========================
  // LOGIN
  // =========================

  if (path.includes("login.html")) {
    const form = document.getElementById("login-form");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document
          .getElementById("email")
          .value.trim()
          .toLowerCase();

        const password =
          document.getElementById("password").value;

        const users = getUsers();

        const user = users.find(
          (item) =>
            item.email === email &&
            item.password === password
        );

        if (!user) {
          alert("ইমেইল অথবা পাসওয়ার্ড ভুল।");
          return;
        }

        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills || "",
            balance: user.balance || 0
          })
        );

        alert("লগইন সফল হয়েছে।");

        window.location.href = "dashboard.html";
      });
    }
  }

  // =========================
  // LOGOUT
  // =========================

  document.addEventListener("click", (e) => {
    const logoutButton = e.target.closest("#logout-btn");

    if (!logoutButton) return;

    e.preventDefault();

    localStorage.removeItem("currentUser");

    window.location.href = "index.html";
  });

  // =========================
  // HOME / JOB SEARCH
  // =========================

  if (
    path.endsWith("/") ||
    path.includes("index.html")
  ) {
    const jobList =
      document.getElementById("job-list");

    const searchInput =
      document.getElementById("job-search");

    const noJobs =
      document.getElementById("no-jobs");

    function renderJobs(keyword = "") {
      if (!jobList) return;

      const jobs = getJobs();

      const search =
        keyword.trim().toLowerCase();

      const filteredJobs = jobs.filter((job) => {
        const text = [
          job.title,
          job.description,
          job.skills,
          job.postedByName
        ]
          .join(" ")
          .toLowerCase();

        return text.includes(search);
      });

      jobList.innerHTML = "";

      if (filteredJobs.length === 0) {
        if (noJobs) {
          noJobs.hidden = false;
        }

        return;
      }

      if (noJobs) {
        noJobs.hidden = true;
      }

      filteredJobs
        .slice()
        .reverse()
        .forEach((job) => {
          const li =
            document.createElement("li");

          li.className = "job-card";

          li.innerHTML = `
            <h3>${escapeHTML(job.title)}</h3>

            <p>
              ${escapeHTML(job.description)}
            </p>

            <p>
              <strong>বাজেট:</strong>
              ${escapeHTML(job.budget)} BDT
            </p>

            <p>
              <strong>স্কিল:</strong>
              ${escapeHTML(job.skills)}
            </p>

            <p>
              <strong>Client:</strong>
              ${escapeHTML(job.postedByName)}
            </p>

            <a
              class="primary-link"
              href="job-details.html?id=${encodeURIComponent(job.id)}"
            >
              বিস্তারিত ও বিড
            </a>
          `;

          jobList.appendChild(li);
        });
    }

    renderJobs();

    if (searchInput) {
      searchInput.addEventListener(
        "input",
        () => {
          renderJobs(searchInput.value);
        }
      );
    }
  }

  // =========================
  // POST JOB
  // =========================

  if (path.includes("post-job.html")) {
    if (!requireLogin()) return;

    const user = getCurrentUser();

    if (user.role !== "client") {
      alert(
        "শুধুমাত্র Client কাজ পোস্ট করতে পারবেন।"
      );

      window.location.href = "dashboard.html";

      return;
    }

    const form =
      document.getElementById("job-form");

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();

        const title =
          document.getElementById("title")
            .value.trim();

        const description =
          document.getElementById("desc")
            .value.trim();

        const budget =
          Number(
            document.getElementById("budget")
              .value
          );

        const skills =
          document.getElementById("skills")
            .value.trim();

        if (
          !title ||
          !description ||
          !skills ||
          budget <= 0
        ) {
          alert(
            "সব তথ্য সঠিকভাবে পূরণ করুন।"
          );

          return;
        }

        const jobs = getJobs();

        jobs.push({
          id: Date.now().toString(),
          title,
          description,
          budget,
          skills,
          postedBy: user.email,
          postedByName: user.name,
          status: "open",
          createdAt: new Date().toISOString()
        });

        saveJobs(jobs);

        alert(
          "কাজ সফলভাবে পোস্ট হয়েছে।"
        );

        window.location.href =
          "dashboard.html";
      });
    }
  }

  // =========================
  // JOB DETAILS + BID
  // =========================

  if (path.includes("job-details.html")) {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const jobId =
      params.get("id");

    const jobs = getJobs();

    const job =
      jobs.find(
        (item) => item.id === jobId
      );

    const titleEl =
      document.getElementById("job-title");

    const descEl =
      document.getElementById("job-desc");

    const budgetEl =
      document.getElementById("job-budget");

    const skillsEl =
      document.getElementById("job-skills");

    const bidSection =
      document.getElementById("bid-section");

    const bidForm =
      document.getElementById("bid-form");

    if (!job) {
      if (titleEl) {
        titleEl.textContent =
          "কাজ পাওয়া যায়নি";
      }

      if (descEl) {
        descEl.textContent =
          "এই কাজটি আর নেই অথবা লিংকটি ভুল।";
      }

      if (bidSection) {
        bidSection.style.display =
          "none";
      }
    } else {
      if (titleEl) {
        titleEl.textContent =
          job.title;
      }

      if (descEl) {
        descEl.textContent =
          job.description;
      }

      if (budgetEl) {
        budgetEl.textContent =
          job.budget;
      }

      if (skillsEl) {
        skillsEl.textContent =
          job.skills;
      }

      const user =
        getCurrentUser();

      if (
        user &&
        user.email === job.postedBy
      ) {
        if (bidSection) {
          bidSection.innerHTML = `
            <p class="notice">
              এটি আপনার নিজের পোস্ট করা কাজ।
              নিজের কাজে বিড করা যাবে না।
            </p>
          `;
        }
      } else if (bidForm) {
        bidForm.addEventListener(
          "submit",
          (e) => {
            e.preventDefault();

            if (!requireLogin()) return;

            const currentUser =
              getCurrentUser();

            if (
              currentUser.role !==
              "worker"
            ) {
              alert(
                "শুধুমাত্র Worker কাজে বিড করতে পারবেন।"
              );

              return;
            }

            const bids =
              getBids();

            const alreadyBid =
              bids.some(
                (bid) =>
                  bid.jobId === job.id &&
                  bid.workerEmail ===
                    currentUser.email
              );

            if (alreadyBid) {
              alert(
                "আপনি এই কাজে ইতিমধ্যে বিড করেছেন।"
              );

              return;
            }

            const cover =
              document
                .getElementById("cover")
                .value.trim();

            const amount =
              Number(
                document
                  .getElementById(
                    "bid-amount"
                  )
                  .value
              );

            const days =
              Number(
                document
                  .getElementById(
                    "delivery-days"
                  )
                  .value
              );

            if (
              !cover ||
              amount <= 0 ||
              days <= 0
            ) {
              alert(
                "বিডের সব তথ্য সঠিকভাবে দিন।"
              );

              return;
            }

            bids.push({
              id:
                Date.now().toString(),

              jobId:
                job.id,

              jobTitle:
                job.title,

              clientEmail:
                job.postedBy,

              workerEmail:
                currentUser.email,

              workerName:
                currentUser.name,

              cover,

              amount,

              days,

              status:
                "pending",

              createdAt:
                new Date().toISOString(),

              time:
                new Date().toLocaleString(
                  "bn-BD"
                )
            });

            saveBids(bids);

            alert(
              "আপনার বিড সফলভাবে জমা হয়েছে।"
            );

            window.location.href =
              "dashboard.html";
          }
        );
      }
    }
  }

  // =========================
  // PROFILE
  // =========================

  if (path.includes("profile.html")) {
    if (!requireLogin()) return;

    const user =
      getCurrentUser();

    const nameEl =
      document.getElementById(
        "user-name"
      );

    const emailEl =
      document.getElementById(
        "user-email"
      );

    const roleEl =
      document.getElementById(
        "user-role"
      );

    const skillsEl =
      document.getElementById(
        "user-skills"
      );

    if (nameEl) {
      nameEl.textContent =
        user.name;
    }

    if (emailEl) {
      emailEl.textContent =
        user.email;
    }

    if (roleEl) {
      roleEl.textContent =
        user.role === "client"
          ? "ক্লায়েন্ট"
          : "ওয়ার্কার";
    }

    if (skillsEl) {
      skillsEl.textContent =
        user.skills ||
        "উল্লেখ করা হয়নি";
    }
  }

  // =========================
  // DASHBOARD
  // =========================

  if (path.includes("dashboard.html")) {
    if (!requireLogin()) return;

    const user =
      getCurrentUser();

    const jobs =
      getJobs();

    const bids =
      getBids();

    const jobsList =
      document.getElementById(
        "jobs-list"
      );

    const bidsList =
      document.getElementById(
        "bids-list"
      );

    const myJobs =
      jobs.filter(
        (job) =>
          job.postedBy ===
          user.email
      );

    const myBids =
      bids.filter(
        (bid) =>
          bid.workerEmail ===
          user.email
      );

    if (jobsList) {
      jobsList.innerHTML = "";

      if (myJobs.length === 0) {
        jobsList.innerHTML = `
          <li class="empty-state">
            আপনার কোনো পোস্ট করা কাজ নেই।
          </li>
        `;
      } else {
        myJobs
          .slice()
          .reverse()
          .forEach((job) => {
            const li =
              document.createElement(
                "li"
              );

            li.className =
              "job-card";

            li.innerHTML = `
              <h3>
                ${escapeHTML(job.title)}
              </h3>

              <p>
                <strong>বাজেট:</strong>
                ${escapeHTML(job.budget)}
                BDT
              </p>

              <p>
                <strong>স্ট্যাটাস:</strong>
                ${escapeHTML(job.status)}
              </p>

              <a
                class="primary-link"
                href="job-details.html?id=${encodeURIComponent(job.id)}"
              >
                কাজ দেখুন
              </a>
            `;

            jobsList.appendChild(li);
          });
      }
    }

    if (bidsList) {
      bidsList.innerHTML = "";

      if (myBids.length === 0) {
        bidsList.innerHTML = `
          <li class="empty-state">
            আপনার কোনো বিড নেই।
          </li>
        `;
      } else {
        myBids
          .slice()
          .reverse()
          .forEach((bid) => {
            const li =
              document.createElement(
                "li"
              );

            li.className =
              "bid-card";

            li.innerHTML = `
              <h3>
                ${escapeHTML(
                  bid.jobTitle
                )}
              </h3>

              <p>
                <strong>আপনার অফার:</strong>
                ${escapeHTML(
                  bid.amount
                )} BDT
              </p>

              <p>
                <strong>সময়:</strong>
                ${escapeHTML(
                  bid.days
                )} দিন
              </p>

              <p>
                <strong>স্ট্যাটাস:</strong>
                ${escapeHTML(
                  bid.status
                )}
              </p>

              <p>
                <strong>জমা:</strong>
                ${escapeHTML(
                  bid.time || ""
                )}
              </p>
            `;

            bidsList.appendChild(li);
          });
      }
    }
  }

  // =========================
  // Hide Client-only link
  // =========================

  const currentUser =
    getCurrentUser();

  if (
    currentUser &&
    currentUser.role !== "client"
  ) {
    document
      .querySelectorAll(
        'a[href="post-job.html"]'
      )
      .forEach((link) => {
        link.style.display =
          "none";
      });
  }
});
