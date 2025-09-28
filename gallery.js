document.addEventListener("DOMContentLoaded", () => {
  console.log("Галерея завантажена")

  // JSONBin конфігурація
  const JSONBIN_CONFIG = {
    API_KEY: "$2a$10$8vF2qJ9mK3nL5pR7sT1uXeY4wZ6bN8cM2dF5gH7jK9lP3qR5sT8vW",
    BIN_ID: "676f8a2bad19ca34f8c8e5d2",
    BASE_URL: "https://api.jsonbin.io/v3/b",
  }


  async function loadSaunasFromCloud() {
    try {
      console.log("Завантаження бань з хмари для галереї")

      const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": JSONBIN_CONFIG.API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const saunas = result.record.saunas || []
      console.log("Завантажено бань з хмари:", saunas.length)
      return saunas
    } catch (error) {
      console.error("Помилка завантаження з хмари:", error)
      const localSaunas = JSON.parse(localStorage.getItem("adminSaunas")) || []
      console.log("Використовуємо локальні дані:", localSaunas.length)
      return localSaunas
    }
  }

  // Глобальні змінні
  let allSaunas = []
  let filteredSaunas = []
  let currentFilter = "all"

  // Ініціалізація галереї
  async function initializeGallery() {
    try {
      console.log("Ініціалізація галереї")
      allSaunas = await loadSaunasFromCloud()
      filteredSaunas = [...allSaunas]

      console.log("Завантажено бань для галереї:", allSaunas.length)

      displaySaunas(filteredSaunas)
      setupEventListeners()

      if (allSaunas.length === 0) {
        showNoResults("Бані ще не додано. Додайте бані через адмін панель.")
      }
    } catch (error) {
      console.error("Помилка ініціалізації галереї:", error)
      showNoResults("Помилка завантаження даних")
    }
  }

  // Відображення бань
  function displaySaunas(saunas) {
    const galleryItems = document.querySelector(".gallery-items")
    if (!galleryItems) {
      console.error("Елемент gallery-items не знайдено")
      return
    }

    galleryItems.innerHTML = ""

    if (saunas.length === 0) {
      showNoResults("Бані за вашим запитом не знайдено")
      return
    }

    hideNoResults()

    saunas.forEach((sauna, index) => {
      const saunaCard = createSaunaCard(sauna, index)
      galleryItems.appendChild(saunaCard)
    })

    // Анімації появи
    animateCards()
  }

  // Створення картки бані
  function createSaunaCard(sauna, index) {
    const card = document.createElement("article")
    card.className = "gallery-item animate-on-scroll"
    card.setAttribute("data-category", sauna.category)
    card.style.animationDelay = `${index * 0.1}s`

    const mainImage =
      sauna.images && sauna.images.length > 0 ? sauna.images[0] : "/placeholder.svg?height=300&width=400"

    card.innerHTML = `
      <div class="gallery-item-image">
        <img src="${mainImage}" alt="${sauna.title}" loading="lazy">
        <div class="gallery-item-overlay">
          <a href="sauna-detail.html?id=${sauna.id}" class="btn-view">Детальніше</a>
        </div>
        <div class="category-badge">${getCategoryName(sauna.category)}</div>
      </div>
      <div class="gallery-item-info">
        <h3>${sauna.title}</h3>
        <p>Площа: ${sauna.area} • Матеріал: ${sauna.material}</p>
        <div class="gallery-tags">
          <span class="gallery-tag">${sauna.category}</span>
        </div>
      </div>
    `

    // Додаємо обробник для кліку по картці
    card.addEventListener("click", () => {
      window.location.href = `sauna-detail.html?id=${sauna.id}`
    })

    return card
  }

  // Налаштування обробників подій
  function setupEventListeners() {
    // Фільтри
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const filter = button.getAttribute("data-filter")
        setActiveFilter(button)
        filterSaunas(filter)
      })
    })

    // Пошук
    const searchInput = document.querySelector(".search-input")
    if (searchInput) {
      searchInput.addEventListener("input", debounce(handleSearch, 300))
    }
  }

  // Фільтрація бань
  function filterSaunas(filter) {
    currentFilter = filter

    if (filter === "all") {
      filteredSaunas = [...allSaunas]
    } else {
      filteredSaunas = allSaunas.filter((sauna) => sauna.category === filter)
    }

    displaySaunas(filteredSaunas)
  }

  // Обробка пошуку
  function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase()

    if (!searchTerm) {
      displaySaunas(filteredSaunas)
      return
    }

    const searchResults = filteredSaunas.filter((sauna) => {
      return (
        sauna.title.toLowerCase().includes(searchTerm) ||
        sauna.description.toLowerCase().includes(searchTerm) ||
        sauna.material.toLowerCase().includes(searchTerm) ||
        (sauna.features && sauna.features.some((feature) => feature.toLowerCase().includes(searchTerm)))
      )
    })

    displaySaunas(searchResults)
  }

  // Встановлення активного фільтра
  function setActiveFilter(activeButton) {
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.classList.remove("active")
    })
    activeButton.classList.add("active")
  }

  // Анімації карток
  function animateCards() {
    const cards = document.querySelectorAll(".gallery-item")

    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            cardObserver.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    cards.forEach((card) => {
      cardObserver.observe(card)
    })
  }

  // Показ повідомлення про відсутність результатів
  function showNoResults(message) {
    const galleryItems = document.querySelector(".gallery-items")
    if (galleryItems) {
      galleryItems.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search"></i>
          <h3>Результатів не знайдено</h3>
          <p>${message}</p>
        </div>
      `
    }
  }

  // Приховування повідомлення про відсутність результатів
  function hideNoResults() {
    // Функція викликається автоматично при відображенні бань
  }

  // Отримання назви категорії
  function getCategoryName(category) {
    const categories = {
      traditional: "Традиційні",
      modern: "Сучасні",
      premium: "Преміум",
    }
    return categories[category] || category
  }

  // Debounce функція
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // Мобільне меню
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn")
  const navMenu = document.querySelector(".nav-menu")

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active")
      mobileMenuBtn.classList.toggle("active")
    })
  }

  // Sticky навігація
  const header = document.querySelector("header")
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 50) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  }

  // Ініціалізація
  initializeGallery()

  // Оновлення галереї кожні 30 секунд
  setInterval(async () => {
    const newSaunas = await loadSaunasFromCloud()
    if (JSON.stringify(newSaunas) !== JSON.stringify(allSaunas)) {
      allSaunas = newSaunas
      filterSaunas(currentFilter)
    }
  }, 30000)

  console.log("Скрипт галереї завантажено")
})
