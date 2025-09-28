document.addEventListener("DOMContentLoaded", () => {
  // ======= АНІМАЦІЯ ПОЯВИ СЕКЦІЙ ПРИ ПРОКРУЧУВАННІ =======
  const animateSections = () => {
    const sections = document.querySelectorAll("section")
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
          observer.unobserve(entry.target)
        }
      })
    }, options)

    sections.forEach((section) => {
      observer.observe(section)
    })
  }

  // ======= ЗМІНА СТИЛЮ ШАПКИ ПРИ ПРОКРУЧУВАННІ =======
  const handleHeaderScroll = () => {
    const header = document.querySelector("header")
    window.addEventListener("scroll", () => {
      if (window.scrollY > 100) {
        header.classList.add("scrolled")
      } else {
        header.classList.remove("scrolled")
      }
    })
  }

  // ======= ПЛАВНА ПРОКРУТКА ДО СЕКЦІЙ =======
  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault()
        const targetSection = document.querySelector(this.getAttribute("href"))
        if (targetSection) {
          targetSection.scrollIntoView({
            behavior: "smooth",
          })
        }
      })
    })
  }

  // ======= СЛАЙДЕР ДЛЯ ГАЛЕРЕЇ =======
  const initGallerySlider = () => {
    const slider = document.querySelector(".slider-track")
    if (!slider) return

    const slides = document.querySelectorAll(".slide")
    const prevBtn = document.querySelector(".slider-btn.prev")
    const nextBtn = document.querySelector(".slider-btn.next")
    let currentSlide = 0
    let autoSlideInterval

    function showSlide(index) {
      slider.style.transform = `translateX(-${index * 100}%)`
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index)
      })
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length
      showSlide(currentSlide)
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length
      showSlide(currentSlide)
    }

    function startAutoSlide() {
      autoSlideInterval = setInterval(nextSlide, 5000)
    }

    function stopAutoSlide() {
      clearInterval(autoSlideInterval)
    }

    // Ініціалізація слайдера
    if (slides.length > 0) {
      showSlide(0)
      startAutoSlide()

      // Додаємо обробники подій
      prevBtn.addEventListener("click", () => {
        prevSlide()
        stopAutoSlide()
        startAutoSlide()
      })

      nextBtn.addEventListener("click", () => {
        nextSlide()
        stopAutoSlide()
        startAutoSlide()
      })

      // Зупиняємо автоматичну зміну слайдів при наведенні
      slider.addEventListener("mouseenter", stopAutoSlide)
      slider.addEventListener("mouseleave", startAutoSlide)

      // Додаємо підтримку свайпів для мобільних пристроїв
      let touchStartX = 0
      let touchEndX = 0

      slider.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX
      })

      slider.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX
        handleSwipe()
      })

      function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          nextSlide()
        } else if (touchEndX > touchStartX + 50) {
          prevSlide()
        }
      }
    }
  }

  // ======= ФОРМА ЗВОРОТНОГО ЗВ'ЯЗКУ =======
  const initContactForm = () => {
    const contactForm = document.getElementById("contact-form")
    if (!contactForm) return

    contactForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Анімація кнопки при відправці
      const submitButton = contactForm.querySelector("button[type='submit']")
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...'
      submitButton.disabled = true

      // Імітація відправки форми (замініть на реальний AJAX запит)
      setTimeout(() => {
        // Тут можна додати логіку відправки форми на сервер
        const formStatus = document.getElementById("form-status") || document.createElement("div")
        formStatus.id = "form-status"
        formStatus.textContent = "Дякуємо за ваше повідомлення! Ми зв'яжемося з вами найближчим часом."
        formStatus.style.color = "green"
        formStatus.style.marginTop = "1rem"

        if (!document.getElementById("form-status")) {
          contactForm.appendChild(formStatus)
        }

        submitButton.innerHTML = "Надіслати"
        submitButton.disabled = false
        contactForm.reset()

        // Очищення статусу через 5 секунд
        setTimeout(() => {
          formStatus.textContent = ""
        }, 5000)
      }, 1500)
    })

    // Анімація лейблів форми
    const formInputs = contactForm.querySelectorAll("input, textarea")
    formInputs.forEach((input) => {
      const label = input.previousElementSibling
      if (label && label.tagName === "LABEL") {
        input.addEventListener("focus", () => {
          label.classList.add("active")
        })

        input.addEventListener("blur", () => {
          if (input.value === "") {
            label.classList.remove("active")
          }
        })

        // Перевірка при завантаженні сторінки
        if (input.value !== "") {
          label.classList.add("active")
        }
      }
    })
  }

  // ======= ОБРОБКА ФОРМИ ВІДГУКУ =======
  const initReviewForm = () => {
    const reviewForm = document.getElementById("review-form")
    if (!reviewForm) return

    // Завантаження існуючих відгуків з localStorage
    loadReviews()

    reviewForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const name = document.getElementById("review-name").value
      const rating = document.querySelector('input[name="rating"]:checked').value
      const reviewText = document.getElementById("review-text").value

      // Анімація кнопки при відправці
      const submitButton = reviewForm.querySelector(".btn-submit")
      submitButton.style.pointerEvents = "none"
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...'

      // Імітація відправки на сервер
      setTimeout(() => {
        // Повернення кнопки до початкового стану
        submitButton.style.pointerEvents = "auto"
        submitButton.innerHTML = "Надіслати відгук"

        // Додавання відгуку на сторінку
        addReviewToPage(name, rating, reviewText)

        // Збереження відгуку в localStorage
        saveReview(name, rating, reviewText)

        // Скидання форми
        reviewForm.reset()
      }, 1500)
    })

    // Анімація зірок рейтингу
    const starLabels = document.querySelectorAll(".star-rating label")
    starLabels.forEach((label) => {
      label.addEventListener("mouseenter", () => {
        const currentStar = label.getAttribute("for").replace("star", "")
        highlightStars(currentStar)
      })
    })

    const starRating = document.querySelector(".star-rating")
    starRating.addEventListener("mouseleave", () => {
      const checkedStar = document.querySelector('input[name="rating"]:checked')
      if (checkedStar) {
        highlightStars(checkedStar.value)
      } else {
        resetStars()
      }
    })

    function highlightStars(rating) {
      starLabels.forEach((label) => {
        const star = label.getAttribute("for").replace("star", "")
        if (star <= rating) {
          label.classList.add("active")
        } else {
          label.classList.remove("active")
        }
      })
    }

    function resetStars() {
      starLabels.forEach((label) => {
        label.classList.remove("active")
      })
    }
  }

  // Функція для додавання відгуку на сторінку
  function addReviewToPage(name, rating, text) {
    const reviewsContainer = document.querySelector(".reviews-container")
    if (!reviewsContainer) return

    const newReview = document.createElement("div")
    newReview.classList.add("review", "new-review")
    newReview.innerHTML = `
      <h3>${name}</h3>
      <div class="stars">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</div>
      <p>${text}</p>
      <div class="review-date">${new Date().toLocaleDateString()}</div>
    `
    reviewsContainer.prepend(newReview)

    // Видалення класу new-review після завершення анімації
    setTimeout(() => {
      newReview.classList.remove("new-review")
    }, 500)
  }

  // Функція для збереження відгуку в localStorage
  function saveReview(name, rating, text) {
    const reviews = JSON.parse(localStorage.getItem("gefestwoodReviews")) || []
    const newReview = {
      name,
      rating,
      text,
      date: new Date().toISOString(),
    }
    reviews.unshift(newReview) // Д��даємо новий відгук на початок масиву
    localStorage.setItem("gefestwoodReviews", JSON.stringify(reviews))
  }

  // Функція для завантаження відгуків з localStorage
  function loadReviews() {
    const reviewsContainer = document.querySelector(".reviews-container")
    if (!reviewsContainer) return

    const reviews = JSON.parse(localStorage.getItem("gefestwoodReviews")) || []

    if (reviews.length > 0) {
      reviewsContainer.innerHTML = "" // Очищаємо контейнер

      reviews.forEach((review, index) => {
        const reviewElement = document.createElement("div")
        reviewElement.classList.add("review")
        reviewElement.style.animationDelay = `${index * 0.1}s`

        const reviewDate = new Date(review.date).toLocaleDateString()

        reviewElement.innerHTML = `
          <h3>${review.name}</h3>
          <div class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
          <p>${review.text}</p>
          <div class="review-date">${reviewDate}</div>
        `

        reviewsContainer.appendChild(reviewElement)
      })
    }
  }

  // ======= ФУНКЦІОНАЛЬНІСТЬ МОДАЛЬНОГО ВІКНА ДЛЯ СЕКЦІЇ "БІОЛОГІЯ БАНІ" =======
  const initBiologyModal = () => {
    const biologyModal = document.getElementById("biology-modal")
    const btnBiologyMore = document.getElementById("btn-biology-more")
    const closeModalBiology = document.querySelector(".close-modal")

    if (!biologyModal || !btnBiologyMore || !closeModalBiology) return

    btnBiologyMore.addEventListener("click", () => {
      biologyModal.style.display = "block"
      document.body.style.overflow = "hidden" // Заборонити прокрутку сторінки

      // Анімація появи модального вікна
      setTimeout(() => {
        biologyModal.classList.add("active")
      }, 10)
    })

    closeModalBiology.addEventListener("click", () => {
      biologyModal.classList.remove("active")

      // Затримка перед приховуванням модального вікна
      setTimeout(() => {
        biologyModal.style.display = "none"
        document.body.style.overflow = "auto" // Дозволити прокрутку сторінки
      }, 300)
    })

    window.addEventListener("click", (event) => {
      if (event.target === biologyModal) {
        biologyModal.classList.remove("active")

        setTimeout(() => {
          biologyModal.style.display = "none"
          document.body.style.overflow = "auto" // Дозволити прокрутку сторінки
        }, 300)
      }
    })
  }

  // ======= АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ СЕКЦІЇ "БІОЛОГІЯ БАНІ" =======
  const animateBiologySection = () => {
    const biologyItems = document.querySelectorAll(".biology-item")
    const biologyInfo = document.querySelector(".biology-info")

    if (biologyItems.length === 0) return

    const biologyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1"
              entry.target.style.transform = "translateY(0)"
            }, index * 200)
            biologyObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    biologyItems.forEach((item) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      biologyObserver.observe(item)
    })

    if (biologyInfo) {
      biologyObserver.observe(biologyInfo)
    }
  }

  // ======= АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ СЕКЦІЇ "НАШІ ПОСЛУГИ" =======
  const animateServicesSection = () => {
    const serviceItems = document.querySelectorAll(".service-item")

    if (serviceItems.length === 0) return

    const serviceObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1"
              entry.target.style.transform = "translateY(0)"
            }, index * 200)
            serviceObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    serviceItems.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      serviceObserver.observe(item)
    })

    // Додавання ефекту при наведенні на іконки послуг
    serviceItems.forEach((item) => {
      const icon = item.querySelector(".service-icon")
      if (icon) {
        item.addEventListener("mouseenter", () => {
          icon.style.transform = "scale(1.1) rotate(10deg)"
        })
        item.addEventListener("mouseleave", () => {
          icon.style.transform = "scale(1) rotate(0deg)"
        })
      }
    })
  }

  // ======= ФУНКЦІОНАЛЬНІСТЬ ГАЛЕРЕЇ =======
  const initGalleryModal = () => {
    const galleryItems = document.querySelectorAll(".gallery-item")
    const modal = document.getElementById("gallery-modal")

    if (galleryItems.length === 0 || !modal) return

    const modalImg = document.getElementById("modal-img")
    const modalCaption = document.getElementById("modal-caption")
    const closeModalGallery = document.querySelector(".gallery-modal .close-modal")

    galleryItems.forEach((item) => {
      item.addEventListener("click", function () {
        const img = this.querySelector("img")
        const caption = this.querySelector("h3").textContent

        modal.style.display = "block"
        modalImg.src = img.src
        modalCaption.textContent = caption
        document.body.style.overflow = "hidden"

        // Анімація появи модального вікна
        setTimeout(() => {
          modal.classList.add("active")
        }, 10)
      })
    })

    closeModalGallery.addEventListener("click", () => {
      modal.classList.remove("active")

      setTimeout(() => {
        modal.style.display = "none"
        document.body.style.overflow = "auto"
      }, 300)
    })

    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.classList.remove("active")

        setTimeout(() => {
          modal.style.display = "none"
          document.body.style.overflow = "auto"
        }, 300)
      }
    })
  }

  // ======= АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ГАЛЕРЕЇ =======
  const animateGalleryItems = () => {
    const galleryItems = document.querySelectorAll(".gallery-item")

    if (galleryItems.length === 0) return

    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.style.opacity = "1"
              entry.target.style.transform = "translateY(0)"
            }, index * 100)
            galleryObserver.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    galleryItems.forEach((item, index) => {
      item.style.opacity = "0"
      item.style.transform = "translateY(20px)"
      item.style.transition = "opacity 0.5s ease, transform 0.5s ease"
      galleryObserver.observe(item)
    })
  }

  // ======= АНІМАЦІЯ ІКОНОК СОЦІАЛЬНИХ МЕРЕЖ =======
  const initSocialIcons = () => {
    const socialIcons = document.querySelectorAll(".social-icon")

    socialIcons.forEach((icon) => {
      icon.addEventListener("mouseenter", () => {
        icon.querySelector("i").style.animation = "bounce 0.5s ease infinite"
      })

      icon.addEventListener("mouseleave", () => {
        icon.querySelector("i").style.animation = "none"
      })
    })
  }

  // ======= ЛІНИВЕ ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ =======
  const initLazyLoading = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]')

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target
            img.src = img.dataset.src || img.src
            img.classList.add("loaded")
            imageObserver.unobserve(img)
          }
        })
      })

      lazyImages.forEach((img) => {
        imageObserver.observe(img)
      })
    } else {
      // Fallback для браузерів, які не підтримують IntersectionObserver
      lazyImages.forEach((img) => {
        img.src = img.dataset.src || img.src
      })
    }
  }

  // ======= АНІМАЦІЯ ЧИСЕЛ =======
  const animateNumbers = () => {
    const numberElements = document.querySelectorAll(".number-animation")

    if (numberElements.length === 0) return

    const numberObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target
            const target = Number.parseInt(element.getAttribute("data-target"))
            let current = 0
            const increment = target / 100
            const duration = 1500 // Тривалість анімації в мс
            const stepTime = duration / 100

            const updateNumber = () => {
              current += increment
              if (current < target) {
                element.textContent = Math.round(current)
                setTimeout(updateNumber, stepTime)
              } else {
                element.textContent = target
              }
            }

            updateNumber()
            numberObserver.unobserve(element)
          }
        })
      },
      { threshold: 0.5 },
    )

    numberElements.forEach((element) => {
      numberObserver.observe(element)
    })
  }

  // ======= ІНІЦІАЛІЗАЦІЯ ВСІХ ФУНКЦІЙ =======
  animateSections()
  handleHeaderScroll()
  initSmoothScroll()
  initGallerySlider()
  initContactForm()
  initReviewForm()
  initBiologyModal()
  animateBiologySection()
  animateServicesSection()
  initGalleryModal()
  animateGalleryItems()
  initSocialIcons()
  initLazyLoading()
  animateNumbers()
})
