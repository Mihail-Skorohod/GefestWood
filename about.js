document.addEventListener("DOMContentLoaded", () => {
  // ======= АНІМАЦІЯ ПОЯВИ ЕЛЕМЕНТІВ ПРИ ПРОКРУЧУВАННІ =======
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".animate-on-scroll")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    elements.forEach((element) => {
      observer.observe(element)
    })
  }

  // ======= ПАРАЛАКС ЕФЕКТ ДЛЯ HERO СЕКЦІЇ =======
  const initParallaxEffect = () => {
    const heroSection = document.querySelector(".about-hero")
    if (!heroSection) return

    window.addEventListener("scroll", () => {
      const scrollPosition = window.pageYOffset
      heroSection.style.backgroundPositionY = `${scrollPosition * 0.5}px`
    })
  }

  // ======= АНІМАЦІЯ ЧИСЕЛ У СЕКЦІЇ "НАША ІСТОРІЯ" =======
  const animateNumbers = () => {
    const numberElements = document.querySelectorAll(".number-animation")
    if (numberElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target
            const target = Number.parseInt(element.getAttribute("data-target"))
            let current = 0
            const increment = target / 100
            const duration = 2000 // Тривалість анімації в мс
            const stepTime = duration / 100

            const updateNumber = () => {
              current += increment
              if (current < target) {
                element.textContent = Math.round(current)
                requestAnimationFrame(() => {
                  setTimeout(updateNumber, stepTime)
                })
              } else {
                element.textContent = target
              }
            }

            updateNumber()
            observer.unobserve(element)
          }
        })
      },
      { threshold: 0.5 },
    )

    numberElements.forEach((element) => {
      observer.observe(element)
    })
  }

  // ======= АНІМАЦІЯ ІКОНОК СОЦІАЛЬНИХ МЕРЕЖ =======
  const initSocialIconsAnimation = () => {
    const socialIcons = document.querySelectorAll(".social-icon")
    if (socialIcons.length === 0) return

    socialIcons.forEach((icon) => {
      icon.addEventListener("mouseenter", () => {
        const iconElement = icon.querySelector("i")
        if (iconElement) {
          iconElement.style.animation = "bounce 0.5s ease infinite"
        }
      })

      icon.addEventListener("mouseleave", () => {
        const iconElement = icon.querySelector("i")
        if (iconElement) {
          iconElement.style.animation = "none"
        }
      })
    })
  }

  // ======= ЗМІНА СТИЛЮ ШАПКИ ПРИ ПРОКРУЧУВАННІ =======
  const handleHeaderScroll = () => {
    const header = document.querySelector("header")
    if (!header) return

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

  // ======= АНІМАЦІЯ КОМАНДИ =======
  const animateTeamMembers = () => {
    const teamMembers = document.querySelectorAll(".team-member")
    if (teamMembers.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible")
            }, index * 200) // Затримка для каскадної анімації
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    teamMembers.forEach((member) => {
      observer.observe(member)
    })
  }

  // ======= АНІМАЦІЯ ЦІННОСТЕЙ =======
  const animateValues = () => {
    const valueItems = document.querySelectorAll(".values-list li")
    if (valueItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible")
            }, index * 150) // Затримка для каскадної анімації
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    valueItems.forEach((item) => {
      observer.observe(item)
    })
  }

  // ======= ЛІНИВЕ ЗАВАНТАЖЕННЯ ЗОБРАЖЕНЬ =======
  const initLazyLoading = () => {
    const lazyImages = document.querySelectorAll("img[loading='lazy']")
    if (lazyImages.length === 0) return

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

  // ======= АНІМАЦІЯ ЗАГОЛОВКІВ =======
  const animateHeadings = () => {
    const headings = document.querySelectorAll("h1, h2")
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    headings.forEach((heading) => {
      observer.observe(heading)
    })
  }

  // ======= АНІМАЦІЯ ФОНУ =======
  const animateBackground = () => {
    const sections = document.querySelectorAll("section")
    if (sections.length === 0) return

    let lastScrollTop = 0

    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollDirection = scrollTop > lastScrollTop ? "down" : "up"
      lastScrollTop = scrollTop

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isVisible) {
          const scrollPercentage = Math.min(Math.max((window.innerHeight - rect.top) / window.innerHeight, 0), 1)

          if (section.classList.contains("about-hero")) {
            section.style.backgroundPositionY = `${scrollPercentage * 50}%`
          }

          if (section.classList.contains("mission")) {
            section.style.backgroundPositionX =
              scrollDirection === "down" ? `${scrollPercentage * 10}%` : `${(1 - scrollPercentage) * 10}%`
          }
        }
      })
    })
  }

  // ======= АНІМАЦІЯ ПОЯВИ ТЕКСТУ =======
  const animateText = () => {
    const paragraphs = document.querySelectorAll("p:not(.animate-on-scroll)")
    if (paragraphs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    paragraphs.forEach((paragraph) => {
      observer.observe(paragraph)
    })
  }

  // ======= АНІМАЦІЯ ЗОБРАЖЕНЬ =======
  const animateImages = () => {
    const images = document.querySelectorAll(".about-image img, .team-member img")
    if (images.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scale-in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    images.forEach((image) => {
      observer.observe(image)
    })
  }

  // ======= ІНТЕРАКТИВНІ ЕЛЕМЕНТИ КОМАНДИ =======
  const initTeamInteraction = () => {
    const teamMembers = document.querySelectorAll(".team-member")
    if (teamMembers.length === 0) return

    teamMembers.forEach((member) => {
      member.addEventListener("mouseenter", () => {
        member.classList.add("active")
      })

      member.addEventListener("mouseleave", () => {
        member.classList.remove("active")
      })

      // Додаємо можливість клікнути для показу додаткової інформації
      member.addEventListener("click", () => {
        // Спочатку закриваємо всі активні картки
        teamMembers.forEach((m) => {
          if (m !== member) {
            m.classList.remove("expanded")
          }
        })

        // Перемикаємо стан поточної картки
        member.classList.toggle("expanded")
      })
    })
  }

  // ======= ДОДАТКОВІ СТИЛІ ДЛЯ МОБІЛЬНИХ ПРИСТРОЇВ =======
  const handleMobileStyles = () => {
    const isMobile = window.innerWidth < 768
    const aboutGrid = document.querySelector(".about-grid")

    if (aboutGrid) {
      if (isMobile) {
        aboutGrid.classList.add("mobile-layout")
      } else {
        aboutGrid.classList.remove("mobile-layout")
      }
    }

    // Оновлюємо стилі при зміні розміру вікна
    window.addEventListener("resize", () => {
      const isMobileNow = window.innerWidth < 768

      if (aboutGrid) {
        if (isMobileNow) {
          aboutGrid.classList.add("mobile-layout")
        } else {
          aboutGrid.classList.remove("mobile-layout")
        }
      }
    })
  }

  // ======= ДОДАТКОВІ ЕФЕКТИ ДЛЯ СОЦІАЛЬНИХ ІКОНОК =======
  const enhanceSocialIcons = () => {
    const socialIcons = document.querySelectorAll(".social-icon")
    if (socialIcons.length === 0) return

    socialIcons.forEach((icon, index) => {
      // Додаємо затримку для каскадної анімації при завантаженні
      icon.style.animationDelay = `${index * 0.1}s`
      icon.classList.add("fade-in")

      // Додаємо підказки при наведенні
      const tooltip = document.createElement("span")
      tooltip.className = "social-tooltip"
      tooltip.textContent = icon.getAttribute("title") || ""
      icon.appendChild(tooltip)

      // Додаємо ефект пульсації при наведенні
      icon.addEventListener("mouseenter", () => {
        icon.classList.add("pulse")
      })

      icon.addEventListener("mouseleave", () => {
        icon.classList.remove("pulse")
      })
    })
  }

  // Додаємо функціональність для мобільного меню
  const initMobileMenu = () => {
    const menuToggle = document.querySelector(".menu-toggle")
    const navMenu = document.querySelector("header nav ul")
    const body = document.body
    const header = document.querySelector("header")

    // Створюємо оверлей для затемнення фону
    const menuOverlay = document.createElement("div")
    menuOverlay.className = "menu-overlay"
    body.appendChild(menuOverlay)

    if (!menuToggle || !navMenu) return

    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active")
      navMenu.classList.toggle("active")
      menuOverlay.classList.toggle("active")
      body.classList.toggle("menu-open")
      header.classList.toggle("menu-open")
    })

    // Закриваємо меню при кліку на оверлей
    menuOverlay.addEventListener("click", () => {
      menuToggle.classList.remove("active")
      navMenu.classList.remove("active")
      menuOverlay.classList.remove("active")
      body.classList.remove("menu-open")
      header.classList.remove("menu-open")
    })

    // Закриваємо меню при кліку на пункт меню
    const menuLinks = navMenu.querySelectorAll("a")
    menuLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active")
        navMenu.classList.remove("active")
        menuOverlay.classList.remove("active")
        body.classList.remove("menu-open")
        header.classList.remove("menu-open")
      })
    })

    // Закриваємо меню при зміні розміру вікна
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        menuToggle.classList.remove("active")
        navMenu.classList.remove("active")
        menuOverlay.classList.remove("active")
        body.classList.remove("menu-open")
        header.classList.remove("menu-open")
      }
    })
  }

  // ======= ІНІЦІАЛІЗАЦІЯ ВСІХ ФУНКЦІЙ =======
  animateOnScroll()
  initParallaxEffect()
  animateNumbers()
  initSocialIconsAnimation()
  handleHeaderScroll()
  initSmoothScroll()
  animateTeamMembers()
  animateValues()
  initLazyLoading()
  animateHeadings()
  animateBackground()
  animateText()
  animateImages()
  initTeamInteraction()
  handleMobileStyles()
  enhanceSocialIcons()
  initMobileMenu()

  // Додаємо CSS класи для анімацій, якщо вони не визначені в CSS файлі
  const style = document.createElement("style")
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.8s ease, transform 0.8s ease;
    }
    
    .animate-on-scroll.visible {
      opacity: 1;
      transform: translateY(0);
    }
    
    .fade-in {
      animation: fadeIn 1s ease forwards;
    }
    
    .scale-in {
      animation: scaleIn 0.8s ease forwards;
    }
    
    .team-member {
      transition: all 0.3s ease;
    }
    
    .team-member.active {
      transform: translateY(-10px);
    }
    
    .team-member.expanded {
      transform: scale(1.05);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      z-index: 2;
    }
    
    .social-tooltip {
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #2c3e50;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      white-space: nowrap;
    }
    
    .social-icon:hover .social-tooltip {
      opacity: 1;
      visibility: visible;
      bottom: -25px;
    }
    
    .pulse {
      animation: pulse 1s infinite;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .mobile-layout {
      display: flex;
      flex-direction: column;
    }
    
    .mobile-layout .about-image {
      order: 1;
    }
    
    .mobile-layout .about-text {
      order: 2;
    }
  `
  document.head.appendChild(style)
})

