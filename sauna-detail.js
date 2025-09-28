document.addEventListener("DOMContentLoaded", () => {
  console.log("Сторінка деталей бані завантажена")

  // JSONBin конфігурація
  const JSONBIN_CONFIG = {
    API_KEY: "$2a$10$8vF2qJ9mK3nL5pR7sT1uXeY4wZ6bN8cM2dF5gH7jK9lP3qR5sT8vW",
    BIN_ID: "676f8a2bad19ca34f8c8e5d2",
    BASE_URL: "https://api.jsonbin.io/v3/b",
  }

  // Функція завантаження бань з хмари
  async function loadSaunasFromCloud() {
    try {
      console.log("Завантаження бань з хмари для деталей")

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

      // Логуємо структуру першої бані для діагностики
      if (saunas.length > 0) {
        console.log("Приклад структури бані:", saunas[0])
      }

      return saunas
    } catch (error) {
      console.error("Помилка завантаження з хмари:", error)
      const localSaunas = JSON.parse(localStorage.getItem("adminSaunas")) || []
      console.log("Використовуємо локальні дані:", localSaunas.length)
      return localSaunas
    }
  }

  // Отримання ID бані з URL
  function getSaunaId() {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("id")
  }

  // Знаходження бані за ID
  async function findSaunaById(id) {
    try {
      const saunas = await loadSaunasFromCloud()
      return saunas.find((sauna) => sauna.id === id)
    } catch (error) {
      console.error("Помилка пошуку бані:", error)
      return null
    }
  }

  // Відображення деталей бані
  async function displaySaunaDetails() {
    const saunaId = getSaunaId()

    if (!saunaId) {
      console.error("ID бані не знайдено в URL")
      showError("ID бані не знайдено в URL")
      return
    }

    console.log("Завантаження деталей для бані:", saunaId)

    // Показуємо індикатор завантаження
    showLoadingState()

    try {
      const sauna = await findSaunaById(saunaId)

      if (!sauna) {
        console.error("Баню не знайдено:", saunaId)
        showError("Баню не знайдено")
        return
      }

      console.log("Знайдено баню:", sauna)
      console.log("Опис бані:", sauna.description)
      console.log("Особливості бані:", sauna.features)

      renderSaunaDetails(sauna)
      setupImageGallery(sauna.images || [])

      // Додаємо анімації після рендерингу
      setTimeout(() => {
        initScrollAnimations()
      }, 300)
    } catch (error) {
      console.error("Помилка відображення деталей:", error)
      showError("Помилка завантаження даних: " + error.message)
    }
  }

  // Рендеринг деталей бані
  function renderSaunaDetails(sauna) {
    console.log("Рендеринг деталей бані:", sauna.title)

    // Заголовок сторінки
    document.title = `${sauna.title} - GefestWood`

    // Заголовок
    const titleElement = document.querySelector(".sauna-title")
    if (titleElement) {
      titleElement.textContent = sauna.title
      titleElement.classList.add("visible")
    }

    // Категорія
    const categoryElement = document.querySelector(".sauna-category")
    if (categoryElement) {
      categoryElement.textContent = getCategoryName(sauna.category)
      categoryElement.className = `sauna-category ${sauna.category}`
      categoryElement.classList.add("visible")
    }

    // Опис - виправляємо селектор та структуру
    const descriptionElement = document.querySelector(".sauna-description")
    if (descriptionElement) {
      descriptionElement.innerHTML = `
      <h2>Опис проекту</h2>
      <p>${sauna.description}</p>
    `
      descriptionElement.classList.add("visible")
    }

    // Характеристики - виправляємо відображення
    const specsContainer = document.querySelector(".sauna-specs")
    if (specsContainer) {
      specsContainer.innerHTML = `
      <div class="spec-item animate-on-scroll">
        <h4><i class="fas fa-ruler-combined"></i> Площа</h4>
        <p>${sauna.area}</p>
      </div>
      <div class="spec-item animate-on-scroll">
        <h4><i class="fas fa-tree"></i> Матеріал</h4>
        <p>${sauna.material}</p>
      </div>
      <div class="spec-item animate-on-scroll">
        <h4><i class="fas fa-clock"></i> Час будівництва</h4>
        <p>${sauna.buildTime}</p>
      </div>
      <div class="spec-item animate-on-scroll">
        <h4><i class="fas fa-users"></i> Місткість</h4>
        <p>${sauna.capacity}</p>
      </div>
    `
    }

    // Особливості - повністю переписуємо логіку
    const featuresContainer = document.querySelector(".sauna-features")
    if (featuresContainer) {
      if (sauna.features && sauna.features.length > 0) {
        // Фільтруємо пусті рядки
        const validFeatures = sauna.features.filter((feature) => feature && feature.trim() !== "")

        if (validFeatures.length > 0) {
          featuresContainer.innerHTML = `
          <h3><i class="fas fa-star"></i> Особливості та переваги</h3>
          <ul class="features-list">
            ${validFeatures.map((feature) => `<li class="feature-item animate-on-scroll">${feature.trim()}</li>`).join("")}
          </ul>
        `
        } else {
          featuresContainer.innerHTML = `
          <h3><i class="fas fa-star"></i> Особливості та переваги</h3>
          <div class="no-features">
            <p>Особливості для цієї бані ще не додано.</p>
          </div>
        `
        }
      } else {
        featuresContainer.innerHTML = `
        <h3><i class="fas fa-star"></i> Особливості та переваги</h3>
        <div class="no-features">
          <p>Особливості для цієї бані ще не додано.</p>
        </div>
      `
      }
      featuresContainer.classList.add("visible")
    }

    console.log("Деталі бані відрендерено успішно")
  }

  // Налаштування галереї зображень
  function setupImageGallery(images) {
    const galleryContainer = document.querySelector(".sauna-gallery .container")
    if (!galleryContainer || !images || images.length === 0) {
      console.log("Галерея зображень не налаштована або немає зображень")
      if (galleryContainer) {
        galleryContainer.innerHTML = `
        <div class="gallery-main">
          <div class="main-image-container">
            <img id="main-image" src="/placeholder.svg?height=600&width=800" alt="Зображення бані">
          </div>
        </div>
      `
      }
      return
    }

    galleryContainer.innerHTML = ""

    // Головне зображення
    const mainImageContainer = document.createElement("div")
    mainImageContainer.className = "main-image-container"
    mainImageContainer.innerHTML = `
    <img id="main-image" src="${images[0]}" alt="Головне зображення">
    ${
      images.length > 1
        ? `
      <div class="image-navigation">
        <button class="nav-btn prev-btn"><i class="fas fa-chevron-left"></i></button>
        <button class="nav-btn next-btn"><i class="fas fa-chevron-right"></i></button>
      </div>
    `
        : ""
    }
  `

    // Мініатюри (тільки якщо більше одного зображення)
    let thumbnailsContainer = null
    if (images.length > 1) {
      thumbnailsContainer = document.createElement("div")
      thumbnailsContainer.className = "thumbnails-container"

      images.forEach((image, index) => {
        const thumbnail = document.createElement("div")
        thumbnail.className = `thumbnail ${index === 0 ? "active" : ""}`
        thumbnail.innerHTML = `<img src="${image}" alt="Мініатюра ${index + 1}">`

        thumbnail.addEventListener("click", () => {
          document.getElementById("main-image").src = image
          document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"))
          thumbnail.classList.add("active")
        })

        thumbnailsContainer.appendChild(thumbnail)
      })
    }

    const galleryMain = document.createElement("div")
    galleryMain.className = "gallery-main"
    galleryMain.appendChild(mainImageContainer)
    if (thumbnailsContainer) {
      galleryMain.appendChild(thumbnailsContainer)
    }

    galleryContainer.appendChild(galleryMain)

    // Навігація по зображеннях (тільки якщо більше одного зображення)
    if (images.length > 1) {
      let currentImageIndex = 0
      const mainImage = document.getElementById("main-image")
      const prevBtn = document.querySelector(".prev-btn")
      const nextBtn = document.querySelector(".next-btn")

      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex - 1 + images.length) % images.length
          mainImage.src = images[currentImageIndex]
          updateActiveThumbnail(currentImageIndex)
        })
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          currentImageIndex = (currentImageIndex + 1) % images.length
          mainImage.src = images[currentImageIndex]
          updateActiveThumbnail(currentImageIndex)
        })
      }

      function updateActiveThumbnail(index) {
        document.querySelectorAll(".thumbnail").forEach((thumb, i) => {
          thumb.classList.toggle("active", i === index)
        })
      }
    }
  }

  // Показ помилки
  function showError(message) {
    document.body.innerHTML = `
      <div class="error-container">
        <div class="error-content">
          <i class="fas fa-exclamation-triangle"></i>
          <h1>Помилка</h1>
          <p>${message}</p>
          <a href="gallery.html" class="btn btn-primary">Повернутися до галереї</a>
        </div>
      </div>
    `
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

  // Ініціалізація анімацій при скролі
  function initScrollAnimations() {
    const animateElements = document.querySelectorAll(".animate-on-scroll")

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    animateElements.forEach((el) => {
      observer.observe(el)
    })
  }

  // Додаємо функцію показу стану завантаження
  function showLoadingState() {
    const titleElement = document.querySelector(".sauna-title")
    const categoryElement = document.querySelector(".sauna-category")
    const descriptionElement = document.querySelector(".sauna-description")

    if (titleElement) titleElement.textContent = "Завантаження..."
    if (categoryElement) categoryElement.textContent = "Завантаження..."
    if (descriptionElement) descriptionElement.innerHTML = "<p>Завантаження опису...</p>"
  }

  // Ініціалізація
  displaySaunaDetails()

  console.log("Скрипт деталей бані завантажено")
})
