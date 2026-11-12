const materials = [
    {
        type: "VIDEO",
        title: "Understanding Type 2 Diabetes",
        duration: "5 min",
        image: "/images/MyDailyCare/MyLibrary/Video1.jpeg",
        link: "#"
    },
    {
        type: "ARTICLE",
        title: "Post-Surgery Care Guide",
        duration: "10 min read",
        image: "/images/MyDailyCare/MyLibrary/Article1.jpeg",
        link: "#"
    },
    {
        type: "VIDEO",
        title: "Nutrition for Heart Health",
        duration: "8 min",
        image: "/images/MyDailyCare/MyLibrary/Video2.jpeg",
        link: "#"
    },
    {
        type: "ARTICLE",
        title: "Managing Stress in Hospital",
        duration: "5 min read",
        image: "/images/MyDailyCare/MyLibrary/Article2.jpeg",
        link: "#"
    }
];

const container = document.getElementById("materials-container");

materials.forEach(item => {

    const icon = item.type === "VIDEO" ? "▶" : "📖";

    const card = document.createElement("div");
    card.className = "card";
    //card.onclick = () => window.open(item.link, "_blank");

    card.innerHTML = `
    <div class="image-wrapper">
      <img src="${item.image}" alt="${item.title}">
      <div class="overlay-icon">${icon}</div>
      <div class="duration">${item.duration}</div>
    </div>
    <div class="card-body">
      <div class="type-label">${item.type}</div>
      <div class="card-title">
        ${item.title}
        <span class="external-icon">↗</span>
      </div>
    </div>
  `;

    container.appendChild(card);
});
function goBack() {
    window.location.href = 'mydailycare.html';
}