document.addEventListener("DOMContentLoaded", () => {
  console.log("Головна сторінка завантажена")

  // JSONBin конфігурація для бань
  const JSONBIN_CONFIG = {
    API_KEY: "$2a$10$8vF2qJ9mK3nL5pR7sT1uXeY4wZ6bN8cM2dF5gH7jK9lP3qR5sT1uXeY4wZ6bN8cM2dF5gH7jK9lP3qR5sT8vW",
    BIN_ID: "676f8a2bad19ca34f8c8e5d2",
    BASE_URL: "https://api.jsonbin.io/v3/b",
  }

  // JSONBin конфігурація для відгуків
  const REVIEWS_JSONBIN_CONFIG = {
    API_KEY: "$2a$10$8vF2qJ9mK3nL5pR7sT1uXeY4wZ6bN8cM2dF5gH7jK9lP3qR5sT8vW",
    BIN_ID: "676f8a2bad19ca34f8c8e5d3", // Окремий bin для відгуків
    BASE_URL: "https://api.jsonbin.io/v3/b",
  }

  // ======= ФУНКЦІЇ ДЛЯ РОБОТИ З БАНЯМИ ======= //
  async function loadSaunasFromCloud() {
    try {
      console.log("Завантаження бань з хмари для головної")

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

  // ======= ФУНКЦІЇ ДЛЯ РОБОТИ З ВІДГУКАМИ ======= //
  async function saveReviewsToCloud(reviews) {
    try {
      console.log("Збереження відгуків в хмару:", reviews.length)

      const response = await fetch(`${REVIEWS_JSONBIN_CONFIG.BASE_URL}/${REVIEWS_JSONBIN_CONFIG.BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": REVIEWS_JSONBIN_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          reviews: reviews,
          lastUpdated: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log("Відгуки збережено в хмару")
      localStorage.setItem("gefestwoodReviews", JSON.stringify(reviews))
      return true
    } catch (error) {
      console.error("Помилка збереження відгуків в хмару:", error)
      localStorage.setItem("gefestwoodReviews", JSON.stringify(reviews))
      return false
    }
  }

  async function loadReviewsFromCloud() {
    try {
      console.log("Завантаження відгуків з хмари")

      const response = await fetch(`${REVIEWS_JSONBIN_CONFIG.BASE_URL}/${REVIEWS_JSONBIN_CONFIG.BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": REVIEWS_JSONBIN_CONFIG.API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      const reviews = result.record.reviews || []
      console.log("Відгуки завантажено з хмари:", reviews.length)

      localStorage.setItem("gefestwoodReviews", JSON.stringify(reviews))
      return reviews
    } catch (error) {
      console.error("Помилка завантаження відгуків з хмари:", error)
      const localReviews = JSON.parse(localStorage.getItem("gefestwoodReviews")) || []
      console.log("Використовуємо локальні відгуки:", localReviews.length)
      return localReviews
    }
  }

  async function saveReview(name, rating, text) {
    try {
      const reviews = await loadReviewsFromCloud()
      const newReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        rating: Number.parseInt(rating),
        text,
        date: new Date().toISOString(),
        approved: true,
      }

      reviews.unshift(newReview)
      const saved = await saveReviewsToCloud(reviews)
      return saved
    } catch (error) {
      console.error("Помилка збереження відгуку:", error)
      return false
    }
  }

  // ======= ФУНКЦІЇ ДЛЯ ВІДОБРАЖЕННЯ ВІДГУКІВ ======= //
  async function loadReviews() {
    const reviewsContainer = document.querySelector(".reviews-container")
    if (!reviewsContainer) {
      console.log("Контейнер відгуків не знайдено")
      return
    }

    try {
      console.log("Завантаження відгуків...")
      const reviews = await loadReviewsFromCloud()
      console.log("Завантажено відгуків:", reviews.length)

      // Очищуємо контейнер, залишаючи тільки статичні відгуки
      const staticReviews = Array.from(reviewsContainer.querySelectorAll(".review:not(.dynamic-review)"))
      reviewsContainer.innerHTML = ""

      // Повертаємо статичні відгуки
      staticReviews.forEach((review) => {
        reviewsContainer.appendChild(review)
      })

      // Додаємо динамічні відгуки
      if (reviews.length > 0) {
        reviews.forEach((review, index) => {
          const reviewElement = document.createElement("div")
          reviewElement.classList.add("review", "dynamic-review", "animate-on-scroll")
          reviewElement.style.animationDelay = `${(staticReviews.length + index) * 0.1}s`

          const reviewDate = new Date(review.date).toLocaleDateString("uk-UA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })

          reviewElement.innerHTML = `
            <h3>${review.name}</h3>
            <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
            <p>${review.text}</p>
            <div class="review-date">${reviewDate}</div>
          `

          reviewsContainer.appendChild(reviewElement)
        })
      }

      // Запускаємо анімації для нових елементів
      initScrollAnimations()
    } catch (error) {
      console.error("Помилка завантаження відгуків:", error)
    }
  }

  function addReviewToPage(name, rating, text) {
    const reviewsContainer = document.querySelector(".reviews-container")
    if (!reviewsContainer) return

    const newReview = document.createElement("div")
    newReview.classList.add("review", "dynamic-review", "new-review")

    const reviewDate = new Date().toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })

    newReview.innerHTML = `
      <h3>${name}</h3>
      <div class="stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
      <p>${text}</p>
      <div class="review-date">${reviewDate}</div>
    `

    reviewsContainer.prepend(newReview)

    // Видаляємо клас new-review після завершення анімації
    setTimeout(() => {
      newReview.classList.remove("new-review")
    }, 500)
  }

  // ======= ІНІЦІАЛІЗАЦІЯ ФОРМИ ВІДГУКІВ ======= //
  function initReviewForm() {
    console.log("Ініціалізація форми відгуків")

    const reviewForm = document.getElementById("review-form")
    if (!reviewForm) {
      console.log("Форма відгуків не знайдена")
      return
    }

    // Завантажуємо існуючі відгуки
    loadReviews()

    // Обробник відправки форми
    reviewForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("Відправка форми відгуку")

      const name = document.getElementById("review-name").value.trim()
      const ratingElement = document.querySelector('input[name="rating"]:checked')
      const reviewText = document.getElementById("review-text").value.trim()

      if (!name || !ratingElement || !reviewText) {
        showReviewMessage("Будь ласка, заповніть всі поля", "error")
        return
      }

      const rating = ratingElement.value

      // Анімація кнопки при відправці
      const submitButton = reviewForm.querySelector(".btn-submit")
      const originalText = submitButton.innerHTML
      submitButton.style.pointerEvents = "none"
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...'

      try {
        const saved = await saveReview(name, rating, reviewText)

        if (saved) {
          addReviewToPage(name, Number.parseInt(rating), reviewText)
          reviewForm.reset()
          resetStars()
          showReviewMessage("Дякуємо за ваш відгук!", "success")

          // Перезавантажуємо відгуки через 2 секунди
          setTimeout(() => {
            loadReviews()
          }, 2000)
        } else {
          showReviewMessage("Помилка при збереженні відгуку", "error")
        }
      } catch (error) {
        console.error("Помилка відправки відгуку:", error)
        showReviewMessage("Помилка при відправці відгуку", "error")
      } finally {
        submitButton.style.pointerEvents = "auto"
        submitButton.innerHTML = originalText
      }
    })

    // Ініціалізація зірок рейтингу
    initStarRating()
  }

  // ======= ФУНКЦІЇ ДЛЯ ЗІРОК РЕЙТИНГУ ======= //
  function initStarRating() {
    console.log("Ініціалізація зірок рейтингу")

    const starLabels = document.querySelectorAll(".star-rating label")
    const starInputs = document.querySelectorAll(".star-rating input")
    const starRating = document.querySelector(".star-rating")

    if (starLabels.length === 0) {
      console.log("Зірки рейтингу не знайдені")
      return
    }

    // Обробники для наведення миші
    starLabels.forEach((label, index) => {
      label.addEventListener("mouseenter", () => {
        const starValue = label.getAttribute("for").replace("star", "")
        highlightStars(Number.parseInt(starValue))
      })

      label.addEventListener("click", () => {
        const starValue = label.getAttribute("for").replace("star", "")
        console.log("Вибрано рейтинг:", starValue)
      })
    })

    // Обробник для виходу миші з області рейтингу
    if (starRating) {
      starRating.addEventListener("mouseleave", () => {
        const checkedStar = document.querySelector('input[name="rating"]:checked')
        if (checkedStar) {
          highlightStars(Number.parseInt(checkedStar.value))
        } else {
          resetStars()
        }
      })
    }

    // Обробники для зміни вибору
    starInputs.forEach((input) => {
      input.addEventListener("change", () => {
        highlightStars(Number.parseInt(input.value))
      })
    })
  }

  function highlightStars(rating) {
    const starLabels = document.querySelectorAll(".star-rating label")
    starLabels.forEach((label) => {
      const star = Number.parseInt(label.getAttribute("for").replace("star", ""))
      if (star <= rating) {
        label.classList.add("active")
      } else {
        label.classList.remove("active")
      }
    })
  }

  function resetStars() {
    const starLabels = document.querySelectorAll(".star-rating label")
    starLabels.forEach((label) => {
      label.classList.remove("active")
    })
  }

  // ======= ДОПОМІЖНІ ФУНКЦІЇ ======= //
  function showReviewMessage(message, type) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `review-message ${type}`
    messageDiv.textContent = message
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1200;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      color: white;
      font-weight: 600;
      max-width: 300px;
      ${type === "success" ? "background-color: #27ae60;" : "background-color: #e74c3c;"}
    `

    document.body.appendChild(messageDiv)

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 5000)
  }

  // ======= ОНОВЛЕННЯ ГАЛЕРЕЇ ======= //
  async function updateMainGallery() {
    const galleryGrid = document.querySelector("#gallery .gallery-grid")
    if (!galleryGrid) return

    try {
      const saunas = await loadSaunasFromCloud()
      galleryGrid.innerHTML = ""

      if (saunas.length === 0) {
        galleryGrid.innerHTML = '<p class="no-saunas">Бані ще не додано через адмін панель</p>'
        return
      }

      const saunasToShow = saunas.slice(0, 4)

      saunasToShow.forEach((sauna) => {
        const galleryItem = document.createElement("div")
        galleryItem.className = "gallery-item animate-on-scroll"

        galleryItem.innerHTML = `
          <img src="${sauna.images[0] || "/placeholder.svg?height=300&width=400"}" alt="${sauna.title}" loading="lazy">
          <div class="gallery-item-overlay">
            <h3>${sauna.title}</h3>
            <a href="sauna-detail.html?id=${sauna.id}" class="btn">Детальніше</a>
          </div>
        `

        galleryGrid.appendChild(galleryItem)
      })
    } catch (error) {
      console.error("Помилка оновлення головної галереї:", error)
    }
  }

  // ======= АНІМАЦІЇ ПРИ СКРОЛІ ======= //
  function initScrollAnimations() {
    const animateElements = document.querySelectorAll(".animate-on-scroll:not(.visible)")

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

  // ======= ПЛАВНИЙ СКРОЛ ======= //
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const target = document.querySelector(this.getAttribute("href"))
        if (target) {
          target.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })
  }

  // ======= МОБІЛЬНЕ МЕНЮ ======= //
  function initMobileMenu() {
    const menuToggle = document.querySelector(".menu-toggle")
    const navMenu = document.querySelector("header nav ul")
    const body = document.body

    if (!menuToggle || !navMenu) return

    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active")
      navMenu.classList.toggle("active")
      body.classList.toggle("menu-open")
    })

    // Закриття меню при кліку на посилання
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active")
        navMenu.classList.remove("active")
        body.classList.remove("menu-open")
      })
    })
  }

  // ======= STICKY НАВІГАЦІЯ ======= //
  function initStickyHeader() {
    const header = document.querySelector("header")
    if (!header) return

    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 100) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  }

  // ======= АВТОСИНХРОНІЗАЦІЯ ======= //
  function startAutoSync() {
    // Синхронізація бань
    setInterval(updateMainGallery, 30000)

    // Синхронізація відгуків
    setInterval(async () => {
      try {
        const cloudReviews = await loadReviewsFromCloud()
        const localReviews = JSON.parse(localStorage.getItem("gefestwoodReviews")) || []

        if (JSON.stringify(cloudReviews) !== JSON.stringify(localReviews)) {
          console.log("Синхронізація відгуків...")
          await loadReviews()
        }
      } catch (error) {
        console.log("Помилка автосинхронізації відгуків:", error)
      }
    }, 30000)
  }

  // ======= ІНІЦІАЛІЗАЦІЯ ======= //
  function initializeAll() {
    console.log("Ініціалізація всіх компонентів")

    initScrollAnimations()
    initSmoothScroll()
    initMobileMenu()
    initStickyHeader()
    initReviewForm()
    updateMainGallery()
    startAutoSync()

    console.log("Всі компоненти ініціалізовано")
  }

  // Запускаємо ініціалізацію
  initializeAll()
})
