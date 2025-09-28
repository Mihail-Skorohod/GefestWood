document.addEventListener("DOMContentLoaded", () => {
  console.log("Адмін панель завантажена")

  // JSONBin конфігурація - ВИПРАВЛЕНА
  const JSONBIN_CONFIG = {
    API_KEY: "$2a$10$V48g2WZTgh.czeaZs3Y5H.yn/uAbsQ4U4uFhqvTSXcszHjZBGMWw2", // Замініть на ваш реальний API ключ
    BIN_ID: "684ff4a1f5fda636aace94d4", // Замініть на ваш реальний BIN ID
    BASE_URL: "https://api.jsonbin.io/v3/b",
  }

  // Константи для авторизації
  const ADMIN_CREDENTIALS = {
    username: "admin",
    password: "gefestwood2025",
  }

  // Глобальні змінні
  let selectedImages = []
  let saunaToDelete = null

  // ======= ФУНКЦІЇ ДЛЯ РОБОТИ З JSONBIN ======= //
  async function saveSaunasToCloud(saunas) {
    try {
      console.log("Збереження бань в хмару:", saunas.length)

      // Перевіряємо конфігурацію
      if (!JSONBIN_CONFIG.API_KEY || !JSONBIN_CONFIG.BIN_ID) {
        throw new Error("JSONBin не налаштований. Перевірте API_KEY та BIN_ID")
      }

      // Створюємо дані для збереження
      const dataToSave = {
        saunas: saunas,
        lastUpdated: new Date().toISOString(),
      }

      const dataString = JSON.stringify(dataToSave)
      console.log("Розмір даних для збереження:", (dataString.length / 1024 / 1024).toFixed(2), "MB")

      // Збільшуємо ліміт до 10MB
      if (dataString.length > 10000000) {
        throw new Error("Дані занадто великі для збереження (більше 10MB)")
      }

      const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_CONFIG.API_KEY,
          "X-Bin-Versioning": "false",
        },
        body: dataString,
      })

      console.log("Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("JSONBin error response:", errorText)
        throw new Error(`JSONBin помилка: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log("Дані збережено в хмару успішно")

      // Зберігаємо локально тільки якщо вдалося зберегти в хмару
      try {
        localStorage.setItem("adminSaunas", JSON.stringify(saunas))
      } catch (localError) {
        console.warn("Не вдалося зберегти локально (можливо, занадто великі дані):", localError)
        // Не блокуємо процес, якщо локальне збереження не вдалося
      }

      return true
    } catch (error) {
      console.error("Детальна помилка збереження в хмару:", error)

      // Зберігаємо локально тільки якщо це не проблема з розміром
      if (!error.message.includes("exceeded the quota") && !error.message.includes("Дані занадто великі")) {
        try {
          localStorage.setItem("adminSaunas", JSON.stringify(saunas))
        } catch (localError) {
          console.error("Помилка локального збереження:", localError)
          showMessage("❌ Локальне сховище переповнене", "error")
          return false
        }
      }

      // Показуємо детальну помилку користувачу
      if (error.message.includes("JSONBin не налаштований")) {
        showMessage("❌ JSONBin не налаштований! Створіть акаунт на jsonbin.io та отримайте API ключ", "error")
      } else if (error.message.includes("401")) {
        showMessage("❌ Неправильний API ключ JSONBin. Перевірте ключ в налаштуваннях", "error")
      } else if (error.message.includes("404")) {
        showMessage("❌ Bin не знайдено. Створіть новий Bin або перевірте BIN_ID", "error")
      } else if (error.message.includes("403")) {
        showMessage("❌ Немає доступу до Bin. Перевірте права доступу", "error")
      } else if (error.message.includes("NetworkError") || error.message.includes("Failed to fetch")) {
        showMessage("❌ Проблема з інтернет-з'єднанням. Перевірте підключення", "error")
      } else if (error.message.includes("exceeded the quota")) {
        showMessage("❌ Сховище JSONBin переповнене. Видаліть старі бані", "error")
      } else if (error.message.includes("Дані занадто великі")) {
        showMessage("❌ Занадто багато даних (більше 10MB). Зменшіть кількість зображень", "error")
      } else {
        showMessage(`❌ Помилка збереження: ${error.message}. Спробуйте ще раз`, "error")
      }

      return false
    }
  }

  async function loadSaunasFromCloud() {
    try {
      console.log("Завантаження бань з хмари")

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
      console.log("Дані завантажено з хмари:", saunas.length)

      localStorage.setItem("adminSaunas", JSON.stringify(saunas))
      return saunas
    } catch (error) {
      console.error("Помилка завантаження з хмари:", error)
      const localSaunas = JSON.parse(localStorage.getItem("adminSaunas")) || []
      console.log("Використовуємо локальні дані:", localSaunas.length)
      return localSaunas
    }
  }

  async function getSaunas() {
    return await loadSaunasFromCloud()
  }

  async function saveSauna(sauna) {
    try {
      console.log("Збереження бані:", sauna.title)

      const saunas = await getSaunas()
      console.log("Поточна кількість бань:", saunas.length)

      // Перевіряємо дублікати
      const existingSauna = saunas.find((s) => s.id === sauna.id)
      if (existingSauna) {
        console.log("Баня з таким ID вже існує, генеруємо новий ID")
        sauna.id = generateId() // Просто генеруємо новий ID
      }

      // Додаємо нову баню
      saunas.push(sauna)

      // Зберігаємо в хмару
      const saved = await saveSaunasToCloud(saunas)

      if (saved) {
        console.log("Баню збережено. Нова кількість:", saunas.length)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Помилка збереження:", error)
      showMessage("Помилка при збереженні: " + error.message, "error")
      return false
    }
  }

  async function updateSauna(id, updatedData) {
    try {
      const saunas = await getSaunas()
      const index = saunas.findIndex((sauna) => sauna.id === id)
      if (index !== -1) {
        saunas[index] = { ...saunas[index], ...updatedData }
        await saveSaunasToCloud(saunas)
        console.log("Баню оновлено:", updatedData.title)
      }
    } catch (error) {
      console.error("Помилка при оновленні бані:", error)
      showMessage("Помилка при оновленні бані", "error")
    }
  }

  async function removeSauna(id) {
    try {
      const saunas = await getSaunas()
      const filteredSaunas = saunas.filter((sauna) => sauna.id !== id)
      await saveSaunasToCloud(filteredSaunas)
      console.log("Баню видалено:", id)
    } catch (error) {
      console.error("Помилка при видаленні бані:", error)
      showMessage("Помилка при видаленні бані", "error")
    }
  }

  async function getSaunaById(id) {
    const saunas = await getSaunas()
    return saunas.find((sauna) => sauna.id === id)
  }

  // ======= ФУНКЦІЇ ДЛЯ ОПТИМІЗАЦІЇ ЗОБРАЖЕНЬ ======= //
  function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Розраховуємо нові розміри
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Малюємо зображення з кращою якістю
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, width, height)

        // Конвертуємо в base64 з вищою якістю
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // ======= ІНІЦІАЛІЗАЦІЯ ======= //
  function initializeAdmin() {
    console.log("Ініціалізація адмін панелі")
    checkAuth()
    initializeEventListeners()
    startAutoSync()

    // Тестуємо JSONBin з'єднання через 2 секунди
    setTimeout(testJSONBinConnection, 2000)
  }

  function initializeEventListeners() {
    // Авторизація
    const loginForm = document.getElementById("login-form")
    const logoutBtn = document.getElementById("logout-btn")

    if (loginForm) {
      loginForm.addEventListener("submit", handleLogin)
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout)
    }

    // Вкладки
    const tabButtons = document.querySelectorAll(".tab-btn")
    tabButtons.forEach((button) => {
      button.addEventListener("click", handleTabClick)
    })

    // Форма додавання бані
    const addSaunaForm = document.getElementById("add-sauna-form")
    if (addSaunaForm) {
      addSaunaForm.addEventListener("submit", handleAddSauna)
    }

    // Завантаження зображень
    const imageInput = document.getElementById("sauna-images")
    const uploadArea = document.querySelector(".image-upload-area")

    if (imageInput) {
      imageInput.addEventListener("change", handleImageSelection)
    }

    if (uploadArea) {
      uploadArea.addEventListener("dragover", handleDragOver)
      uploadArea.addEventListener("dragleave", handleDragLeave)
      uploadArea.addEventListener("drop", handleDrop)
    }

    // Пошук бань
    const searchInput = document.getElementById("search-saunas")
    if (searchInput) {
      searchInput.addEventListener("input", handleSearch)
    }

    // Модальні вікна
    initializeModals()
  }

  // ======= АВТОРИЗАЦІЯ ======= //
  function checkAuth() {
    const isLoggedIn = localStorage.getItem("adminLoggedIn")
    if (isLoggedIn === "true") {
      showAdminPanel()
    } else {
      showLoginModal()
    }
  }

  function showLoginModal() {
    const loginModal = document.getElementById("login-modal")
    const adminPanel = document.getElementById("admin-panel")

    if (loginModal) loginModal.style.display = "flex"
    if (adminPanel) adminPanel.style.display = "none"
  }

  async function showAdminPanel() {
    const loginModal = document.getElementById("login-modal")
    const adminPanel = document.getElementById("admin-panel")

    if (loginModal) loginModal.style.display = "none"
    if (adminPanel) adminPanel.style.display = "block"

    // Завантажуємо дані
    setTimeout(async () => {
      await loadSaunas()
      await updateStatistics()
      loadActivityLog()
    }, 100)
  }

  function handleLogin(e) {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const loginError = document.getElementById("login-error")

    console.log("Спроба входу:", username)

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem("adminLoggedIn", "true")
      showAdminPanel()
      if (loginError) loginError.textContent = ""
      showMessage("Успішний вхід в адмін панель!", "success")
    } else {
      if (loginError) loginError.textContent = "Невірний логін або пароль!"
      showMessage("Невірний логін або пароль!", "error")
    }
  }

  function handleLogout() {
    localStorage.removeItem("adminLoggedIn")
    showLoginModal()
    const loginForm = document.getElementById("login-form")
    if (loginForm) loginForm.reset()
    showMessage("Ви вийшли з адмін панелі", "info")
  }

  // ======= ВКЛАДКИ ======= //
  async function handleTabClick(e) {
    const button = e.currentTarget
    const tabId = button.getAttribute("data-tab")

    // Видаляємо активний клас
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Додаємо активний клас
    button.classList.add("active")
    const tabContent = document.getElementById(tabId)
    if (tabContent) tabContent.classList.add("active")

    // Оновлюємо дані
    if (tabId === "manage-saunas") {
      await loadSaunas()
    } else if (tabId === "statistics") {
      await updateStatistics()
      loadActivityLog()
    }
  }

  // ======= РОБОТА З ЗОБРАЖЕННЯМИ ======= //
  function handleImageSelection(e) {
    const files = Array.from(e.target.files)
    handleImageFiles(files)
  }

  function handleDragOver(e) {
    e.preventDefault()
    e.currentTarget.classList.add("dragover")
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove("dragover")
  }

  function handleDrop(e) {
    e.preventDefault()
    e.currentTarget.classList.remove("dragover")
    const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"))
    handleImageFiles(files)
  }

  async function handleImageFiles(files) {
    if (files.length + selectedImages.length > 10) {
      showMessage("Можна завантажити максимум 10 зображень", "error")
      return
    }

    for (const file of files) {
      try {
        // Показуємо індикатор завантаження
        showMessage(`Обробка зображення ${file.name}...`, "info")

        // Стискаємо зображення з більшою якістю та розміром
        const compressedUrl = await compressImage(file, 1200, 0.8) // Збільшуємо до 1200px і якість до 80%

        const imageData = {
          file: file,
          url: compressedUrl,
          name: file.name,
        }

        selectedImages.push(imageData)
        displayImagePreview()

        showMessage(`Зображення ${file.name} додано`, "success")
      } catch (error) {
        console.error("Помилка обробки зображення:", error)
        showMessage(`Помилка обробки ${file.name}`, "error")
      }
    }
  }

  function displayImagePreview() {
    const imagePreview = document.getElementById("image-preview")
    if (!imagePreview) return

    imagePreview.innerHTML = ""
    selectedImages.forEach((image, index) => {
      const previewItem = document.createElement("div")
      previewItem.className = "preview-item"
      previewItem.innerHTML = `
        <img src="${image.url}" alt="${image.name}">
        <button type="button" class="preview-remove" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      `

      // Додаємо обробник для кнопки видалення
      const removeBtn = previewItem.querySelector(".preview-remove")
      removeBtn.addEventListener("click", () => {
        selectedImages.splice(index, 1)
        displayImagePreview()
      })

      imagePreview.appendChild(previewItem)
    })
  }

  // ======= ДОДАВАННЯ БАНІ ======= //
  function generateId() {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `sauna_${timestamp}_${random}`
  }

  async function handleAddSauna(e) {
    e.preventDefault()
    console.log("Обробка форми додавання бані")

    try {
      // Отримуємо дані з форми
      const title = document.getElementById("sauna-title").value.trim()
      const category = document.getElementById("sauna-category").value
      const area = document.getElementById("sauna-area").value.trim()
      const material = document.getElementById("sauna-material").value.trim()
      const buildTime = document.getElementById("sauna-build-time").value.trim()
      const capacity = document.getElementById("sauna-capacity").value.trim()
      const description = document.getElementById("sauna-description").value.trim()
      const features = document.getElementById("sauna-features").value

      // Детальна валідація
      const errors = []
      if (!title) errors.push("Назва бані")
      if (!category) errors.push("Категорія")
      if (!area) errors.push("Площа")
      if (!material) errors.push("Матеріал")
      if (!buildTime) errors.push("Час будівництва")
      if (!capacity) errors.push("Місткість")
      if (!description) errors.push("Опис")

      if (errors.length > 0) {
        showMessage(`❌ Заповніть обов'язкові поля: ${errors.join(", ")}`, "error")
        return
      }

      // Валідація площі
      const areaNumber = Number.parseFloat(area)
      if (isNaN(areaNumber) || areaNumber <= 0) {
        showMessage("❌ Площа повинна бути числом більше 0", "error")
        return
      }

      // Створюємо об'єкт бані
      const saunaData = {
        id: generateId(),
        title: title,
        category: category,
        area: area + " м²",
        material: material,
        buildTime: buildTime,
        capacity: capacity,
        description: description,
        features: features.split("\n").filter((feature) => feature.trim() !== ""),
        images:
          selectedImages.length > 0 ? selectedImages.map((img) => img.url) : ["/placeholder.svg?height=300&width=400"],
        createdAt: new Date().toISOString(),
      }

      console.log("Дані бані для збереження:", saunaData)

      // Показуємо індикатор завантаження
      const submitButton = e.target.querySelector("button[type='submit']")
      const originalText = submitButton.innerHTML
      submitButton.disabled = true
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Збереження...'

      // Зберігаємо баню
      const saved = await saveSauna(saunaData)

      if (saved) {
        // Очищуємо форму
        e.target.reset()
        selectedImages = []
        displayImagePreview()

        showMessage("✅ Баню успішно додано та синхронізовано!", "success")
        logActivity("add", `Додано нову баню: ${saunaData.title}`)

        // Оновлюємо дані
        setTimeout(async () => {
          await updateStatistics()
          await loadSaunas()
        }, 1000)
      }

      // Повертаємо кнопку до початкового стану
      submitButton.disabled = false
      submitButton.innerHTML = originalText
    } catch (error) {
      console.error("Критична помилка при додаванні бані:", error)
      showMessage(`❌ Критична помилка: ${error.message}`, "error")

      // Повертаємо кнопку до початкового стану
      const submitButton = e.target.querySelector("button[type='submit']")
      if (submitButton) {
        submitButton.disabled = false
        submitButton.innerHTML = "Зберегти баню"
      }
    }
  }

  // ======= УПРАВЛІННЯ БАНЯМИ ======= //
  async function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase()
    await loadSaunas(searchTerm)
  }

  async function loadSaunas(searchTerm = "") {
    console.log("Завантаження списку бань")
    const saunas = await getSaunas()
    console.log("Знайдено бань:", saunas.length)

    const filteredSaunas = saunas.filter(
      (sauna) => sauna.title.toLowerCase().includes(searchTerm) || sauna.category.toLowerCase().includes(searchTerm),
    )

    displaySaunas(filteredSaunas)
  }

  function displaySaunas(saunas) {
    const saunasList = document.getElementById("saunas-list")
    if (!saunasList) {
      console.error("Елемент saunas-list не знайдено")
      return
    }

    if (saunas.length === 0) {
      saunasList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-home"></i>
          <h3>Бані не знайдено</h3>
          <p>Додайте першу баню або змініть критерії пошуку</p>
        </div>
      `
      return
    }

    saunasList.innerHTML = ""
    saunas.forEach((sauna) => {
      const saunaItem = document.createElement("div")
      saunaItem.className = "sauna-item"
      saunaItem.innerHTML = `
        <div class="sauna-image">
          <img src="${sauna.images[0] || "/placeholder.svg?height=100&width=150"}" alt="${sauna.title}">
        </div>
        <div class="sauna-info">
          <h3>${sauna.title}</h3>
          <p><strong>Площа:</strong> ${sauna.area}</p>
          <p><strong>Матеріал:</strong> ${sauna.material}</p>
          <p><strong>Місткість:</strong> ${sauna.capacity}</p>
          <span class="sauna-category ${sauna.category}">${getCategoryName(sauna.category)}</span>
        </div>
        <div class="sauna-actions">
          <button class="btn btn-warning btn-small edit-btn" data-id="${sauna.id}">
            <i class="fas fa-edit"></i> Редагувати
          </button>
          <button class="btn btn-danger btn-small delete-btn" data-id="${sauna.id}" data-title="${sauna.title}">
            <i class="fas fa-trash"></i> Видалити
          </button>
        </div>
      `

      // Додаємо обробники подій
      const editBtn = saunaItem.querySelector(".edit-btn")
      const deleteBtn = saunaItem.querySelector(".delete-btn")

      editBtn.addEventListener("click", () => editSauna(sauna.id))
      deleteBtn.addEventListener("click", () => deleteSauna(sauna.id, sauna.title))

      saunasList.appendChild(saunaItem)
    })
  }

  // ======= РЕДАГУВАННЯ ТА ВИДАЛЕННЯ ======= //
  async function editSauna(saunaId) {
    const sauna = await getSaunaById(saunaId)
    if (!sauna) return

    // Заповнюємо форму
    document.getElementById("edit-sauna-id").value = sauna.id
    document.getElementById("edit-sauna-title").value = sauna.title
    document.getElementById("edit-sauna-category").value = sauna.category
    document.getElementById("edit-sauna-area").value = sauna.area.replace(" м²", "")
    document.getElementById("edit-sauna-material").value = sauna.material
    document.getElementById("edit-sauna-build-time").value = sauna.buildTime
    document.getElementById("edit-sauna-capacity").value = sauna.capacity
    document.getElementById("edit-sauna-description").value = sauna.description
    document.getElementById("edit-sauna-features").value = sauna.features.join("\n")

    const editModal = document.getElementById("edit-modal")
    showModal(editModal)
  }

  function deleteSauna(saunaId, saunaTitle) {
    saunaToDelete = saunaId
    document.getElementById("delete-sauna-name").textContent = saunaTitle
    const deleteModal = document.getElementById("delete-modal")
    showModal(deleteModal)
  }

  // ======= СТАТИСТИКА ======= //
  async function updateStatistics() {
    const saunas = await getSaunas()
    const totalSaunas = saunas.length
    const traditionalSaunas = saunas.filter((s) => s.category === "traditional").length
    const modernSaunas = saunas.filter((s) => s.category === "modern").length
    const premiumSaunas = saunas.filter((s) => s.category === "premium").length

    const totalElement = document.getElementById("total-saunas")
    const traditionalElement = document.getElementById("traditional-saunas")
    const modernElement = document.getElementById("modern-saunas")
    const premiumElement = document.getElementById("premium-saunas")

    if (totalElement) totalElement.textContent = totalSaunas
    if (traditionalElement) traditionalElement.textContent = traditionalSaunas
    if (modernElement) modernElement.textContent = modernSaunas
    if (premiumElement) premiumElement.textContent = premiumSaunas
  }

  // ======= МОДАЛЬНІ ВІКНА ======= //
  function initializeModals() {
    // Редагування
    const editForm = document.getElementById("edit-sauna-form")
    if (editForm) {
      editForm.addEventListener("submit", handleEditSauna)
    }

    // Видалення
    const confirmDeleteBtn = document.getElementById("confirm-delete")
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener("click", handleConfirmDelete)
    }

    // Закриття модальних вікон
    document.querySelectorAll(".close-modal").forEach((closeBtn) => {
      closeBtn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal")
        hideModal(modal)
      })
    })

    document.querySelectorAll(".modal").forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideModal(modal)
        }
      })
    })
  }

  async function handleEditSauna(e) {
    e.preventDefault()

    const saunaId = document.getElementById("edit-sauna-id").value
    const updatedSauna = {
      title: document.getElementById("edit-sauna-title").value,
      category: document.getElementById("edit-sauna-category").value,
      area: document.getElementById("edit-sauna-area").value + " м²",
      material: document.getElementById("edit-sauna-material").value,
      buildTime: document.getElementById("edit-sauna-build-time").value,
      capacity: document.getElementById("edit-sauna-capacity").value,
      description: document.getElementById("edit-sauna-description").value,
      features: document
        .getElementById("edit-sauna-features")
        .value.split("\n")
        .filter((f) => f.trim() !== ""),
    }

    await updateSauna(saunaId, updatedSauna)
    const editModal = document.getElementById("edit-modal")
    hideModal(editModal)
    await loadSaunas()
    await updateStatistics()
    showMessage("Баню успішно оновлено!", "success")
    logActivity("edit", `Відредаговано баню: ${updatedSauna.title}`)
  }

  async function handleConfirmDelete() {
    if (saunaToDelete) {
      const sauna = await getSaunaById(saunaToDelete)
      await removeSauna(saunaToDelete)
      const deleteModal = document.getElementById("delete-modal")
      hideModal(deleteModal)
      await loadSaunas()
      await updateStatistics()
      showMessage("Баню успішно видалено!", "success")
      if (sauna) {
        logActivity("delete", `Видалено баню: ${sauna.title}`)
      }
      saunaToDelete = null
    }
  }

  function showModal(modal) {
    if (modal) {
      modal.style.display = "block"
      document.body.style.overflow = "hidden"
    }
  }

  function hideModal(modal) {
    if (modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  }

  // ======= ЛОГ АКТИВНОСТІ ======= //
  function loadActivityLog() {
    const activities = getActivities()
    const activityLog = document.getElementById("activity-log")

    if (!activityLog) return

    if (activities.length === 0) {
      activityLog.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-history"></i>
          <h3>Немає активності</h3>
          <p>Історія дій з'явиться тут після виконання операцій</p>
        </div>
      `
      return
    }

    activityLog.innerHTML = ""
    activities.slice(0, 10).forEach((activity) => {
      const activityItem = document.createElement("div")
      activityItem.className = "activity-item"
      activityItem.innerHTML = `
        <div class="activity-icon ${activity.type}">
          <i class="fas fa-${getActivityIcon(activity.type)}"></i>
        </div>
        <div class="activity-info">
          <p>${activity.message}</p>
        </div>
        <div class="activity-time">
          ${formatDate(activity.timestamp)}
        </div>
      `
      activityLog.appendChild(activityItem)
    })
  }

  // ======= ДОПОМІЖНІ ФУНКЦІЇ ======= //
  function getCategoryName(category) {
    const categories = {
      traditional: "Традиційні бані",
      modern: "Сучасні бані",
      premium: "Преміум клас",
    }
    return categories[category] || category
  }

  function getActivityIcon(type) {
    const icons = {
      add: "plus",
      edit: "edit",
      delete: "trash",
    }
    return icons[type] || "info"
  }

  function formatDate(timestamp) {
    const date = new Date(timestamp)
    return date.toLocaleString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  function showMessage(message, type) {
    const messageDiv = document.createElement("div")
    messageDiv.className = `${type}-message`
    messageDiv.textContent = message
    messageDiv.style.position = "fixed"
    messageDiv.style.top = "20px"
    messageDiv.style.right = "20px"
    messageDiv.style.zIndex = "1200"
    messageDiv.style.padding = "15px 20px"
    messageDiv.style.borderRadius = "5px"
    messageDiv.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)"

    if (type === "success") {
      messageDiv.style.backgroundColor = "#4CAF50"
      messageDiv.style.color = "white"
    } else if (type === "error") {
      messageDiv.style.backgroundColor = "#f44336"
      messageDiv.style.color = "white"
    } else if (type === "warning") {
      messageDiv.style.backgroundColor = "#ff9800"
      messageDiv.style.color = "white"
    } else {
      messageDiv.style.backgroundColor = "#2196F3"
      messageDiv.style.color = "white"
    }

    document.body.appendChild(messageDiv)

    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove()
      }
    }, 3000)
  }

  // ======= РОБОТА З ЛОКАЛЬНИМ СХОВИЩЕМ ======= //
  function getActivities() {
    try {
      const activities = localStorage.getItem("adminActivities")
      return activities ? JSON.parse(activities) : []
    } catch (error) {
      console.error("Помилка при читанні активності:", error)
      return []
    }
  }

  function logActivity(type, message) {
    try {
      const activities = getActivities()
      const activity = {
        type,
        message,
        timestamp: new Date().toISOString(),
      }
      activities.unshift(activity)
      if (activities.length > 50) {
        activities.splice(50)
      }
      localStorage.setItem("adminActivities", JSON.stringify(activities))
    } catch (error) {
      console.error("Помилка при логуванні активності:", error)
    }
  }

  // ======= АВТОСИНХРОНІЗАЦІЯ ======= //
  function startAutoSync() {
    setInterval(async () => {
      try {
        const cloudSaunas = await loadSaunasFromCloud()
        const localSaunas = JSON.parse(localStorage.getItem("adminSaunas")) || []

        if (JSON.stringify(cloudSaunas) !== JSON.stringify(localSaunas)) {
          localStorage.setItem("adminSaunas", JSON.stringify(cloudSaunas))

          // Оновлюємо інтерфейс якщо потрібно
          if (document.querySelector(".tab-content.active")?.id === "manage-saunas") {
            await loadSaunas()
          }
          if (document.querySelector(".tab-content.active")?.id === "statistics") {
            await updateStatistics()
          }
        }
      } catch (error) {
        console.log("Помилка автосинхронізації:", error)
      }
    }, 30000)
  }

  // ======= ТЕСТУВАННЯ JSONBin З'ЄДНАННЯ ======= //
  async function testJSONBinConnection() {
    try {
      console.log("Тестування з'єднання з JSONBin...")

      const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
        method: "GET",
        headers: {
          "X-Master-Key": JSONBIN_CONFIG.API_KEY,
        },
      })

      if (response.ok) {
        console.log("✅ JSONBin з'єднання працює")
        showMessage("✅ JSONBin підключено успішно", "success")
      } else {
        console.error("❌ JSONBin з'єднання не працює:", response.status)
        showMessage(`❌ JSONBin помилка ${response.status}. Перевірте API ключ та BIN_ID!`, "error")
      }
    } catch (error) {
      console.error("❌ Помилка тестування JSONBin:", error)
      if (error.message.includes("Failed to fetch")) {
        showMessage("❌ Немає інтернет-з'єднання або JSONBin недоступний", "error")
      } else {
        showMessage("❌ Помилка підключення до JSONBin. Перевірте налаштування", "error")
      }
    }
  }

  // ======= ЗАПУСК ======= //
  initializeAdmin()

  console.log("Адмін панель ініціалізована")
})
