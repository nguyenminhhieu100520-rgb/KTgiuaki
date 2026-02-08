// ========================================
// BÀI TẬP 1: CAROUSEL
// ========================================

let currentSlide = 0;
let autoPlayInterval;
const AUTOPLAY_DELAY = 3000; // 3 giây

// Khởi tạo carousel khi trang load
if (document.querySelector('.carousel')) {
    initCarousel();
}

function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    // Hiển thị slide đầu tiên
    showSlide(0);
    
    // Bắt đầu auto play
    startAutoPlay();
    
    // Dừng auto play khi hover
    const carousel = document.querySelector('.carousel');
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);
}

function showSlide(index) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    if (slides.length === 0) return;
    
    // LOGIC XỬ LÝ INDEX ĐỂ TRÁNH NGOÀI GIỚI HẠN
    // Sử dụng modulo để wrap around: nếu index > max thì quay về 0, nếu < 0 thì về max
    // Công thức: (index + totalSlides) % totalSlides đảm bảo luôn có giá trị hợp lệ
    currentSlide = (index + slides.length) % slides.length;
    
    // Remove active class từ tất cả slides và indicators
    slides.forEach(slide => {
        slide.classList.remove('active');
    });
    indicators.forEach(indicator => {
        indicator.classList.remove('active');
    });
    
    // Add active class cho slide và indicator hiện tại
    slides[currentSlide].classList.add('active');
    indicators[currentSlide].classList.add('active');
}

function carouselNavigate(direction) {
    // Reset auto play khi user tương tác
    stopAutoPlay();
    startAutoPlay();
    
    showSlide(currentSlide + direction);
}

function goToSlide(index) {
    // Reset auto play khi user tương tác
    stopAutoPlay();
    startAutoPlay();
    
    showSlide(index);
}

function startAutoPlay() {
    stopAutoPlay(); // Clear interval cũ trước (tránh memory leak)
    autoPlayInterval = setInterval(() => {
        showSlide(currentSlide + 1);
    }, AUTOPLAY_DELAY);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

// ========================================
// BÀI TẬP 2: TODO LIST
// ========================================

// State management: Single source of truth
let todos = [];

// Khởi tạo todo list khi trang load
if (document.getElementById('todoForm')) {
    initTodoList();
}

function initTodoList() {
    // Load từ localStorage
    loadTodos();
    
    // Render UI
    renderTodos();
    
    // Setup event listeners
    document.getElementById('todoForm').addEventListener('submit', handleAddTodo);
}

function loadTodos() {
    try {
        // XỨLÝ LOCALSTORAGE: Parse JSON an toàn
        const savedTodos = localStorage.getItem('todos');
        if (savedTodos) {
            todos = JSON.parse(savedTodos);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
        todos = []; // Fallback to empty array
    }
}

function saveTodos() {
    try {
        // AUTO-SAVE: Serialize và lưu vào localStorage
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

function handleAddTodo(e) {
    e.preventDefault();
    
    const input = document.getElementById('todoInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    // IMMUTABLE UPDATE: Tạo object mới, không modify trực tiếp
    const newTodo = {
        id: Date.now() + Math.random(), // UUID đơn giản
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Thêm vào mảng (tạo copy mới)
    todos = [...todos, newTodo];
    
    // Save và render
    saveTodos();
    renderTodos();
    
    // Clear input
    input.value = '';
    input.focus();
}

function toggleTodo(id) {
    // IMMUTABLE UPDATE: Sử dụng map để tạo mảng mới
    todos = todos.map(todo => 
        todo.id === id 
            ? { ...todo, completed: !todo.completed }
            : todo
    );
    
    saveTodos();
    renderTodos();
}

function deleteTodo(id) {
    // IMMUTABLE UPDATE: Sử dụng filter để tạo mảng mới
    todos = todos.filter(todo => todo.id !== id);
    
    saveTodos();
    renderTodos();
}

function editTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    const newText = prompt('Sửa công việc:', todo.text);
    
    if (newText && newText.trim()) {
        todos = todos.map(t => 
            t.id === id 
                ? { ...t, text: newText.trim() }
                : t
        );
        
        saveTodos();
        renderTodos();
    }
}

function renderTodos() {
    // RENDER HIỆU QUẢ: Clear và rebuild DOM từ state
    const todoList = document.getElementById('todoList');
    
    if (!todoList) return;
    
    // Clear existing content
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        todoList.innerHTML = '<p style="text-align: center; color: var(--gray); padding: 2rem;">Chưa có công việc nào. Hãy thêm công việc mới!</p>';
        updateStats();
        return;
    }
    
    // Render từng todo item
    todos.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        
        todoItem.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            >
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            <button class="todo-btn edit" onclick="editTodo(${todo.id})">Sửa</button>
            <button class="todo-btn delete" onclick="deleteTodo(${todo.id})">Xóa</button>
        `;
        
        todoList.appendChild(todoItem);
    });
    
    // Update statistics
    updateStats();
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const pending = total - completed;
    
    const totalEl = document.getElementById('totalTodos');
    const completedEl = document.getElementById('completedTodos');
    const pendingEl = document.getElementById('pendingTodos');
    
    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = completed;
    if (pendingEl) pendingEl.textContent = pending;
}

// Utility: Escape HTML để tránh XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// BÀI TẬP 3: GAME ĐOÁN SỐ
// ========================================

let secretNumber = 0;
let attempts = 0;
let gameActive = false;
let guessHistory = [];

// Khởi tạo game khi trang load
if (document.getElementById('guessBtn')) {
    initGame();
}

function initGame() {
    // Tạo số ngẫu nhiên
    resetGame();
    
    // Setup event listeners
    document.getElementById('guessBtn').addEventListener('click', handleGuess);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('guessInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    
    // Load best score từ localStorage
    loadBestScore();
}

function resetGame() {
    // TẠO SỐ NGẪU NHIÊN: Math.floor(Math.random() * (max - min + 1)) + min
    // Math.random() tạo số từ 0 đến 0.999...
    // Nhân với 100 được 0 đến 99.999...
    // Math.floor() làm tròn xuống: 0 đến 99
    // Cộng 1: 1 đến 100
    secretNumber = Math.floor(Math.random() * 100) + 1;
    
    attempts = 0;
    gameActive = true;
    guessHistory = [];
    
    // Reset UI
    document.getElementById('attemptCount').textContent = '0';
    document.getElementById('guessInput').value = '';
    document.getElementById('guessInput').disabled = false;
    document.getElementById('guessBtn').disabled = false;
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = 'feedback';
    document.getElementById('historyList').innerHTML = '';
    
    // Clear fireworks
    const fireworks = document.getElementById('fireworks');
    if (fireworks) {
        fireworks.innerHTML = '';
    }
}

function handleGuess() {
    if (!gameActive) return;
    
    const input = document.getElementById('guessInput');
    const feedback = document.getElementById('feedback');
    
    // XỬ LÝ INPUT ĐỂ TRÁNH LỖI
    // 1. Trim khoảng trắng
    const inputValue = input.value.trim();
    
    // 2. Convert sang number
    const guess = Number(inputValue);
    
    // 3. Validation
    if (!inputValue) {
        showFeedback('Vui lòng nhập một số!', 'error');
        return;
    }
    
    // 4. Kiểm tra NaN
    if (isNaN(guess)) {
        showFeedback('Vui lòng nhập một số hợp lệ!', 'error');
        return;
    }
    
    // 5. Kiểm tra range
    if (guess < 1 || guess > 100) {
        showFeedback('Số phải nằm trong khoảng 1-100!', 'error');
        return;
    }
    
    // 6. Kiểm tra số nguyên
    if (!Number.isInteger(guess)) {
        showFeedback('Vui lòng nhập số nguyên!', 'error');
        return;
    }
    
    // Tăng số lần thử
    attempts++;
    document.getElementById('attemptCount').textContent = attempts;
    
    // Thêm vào lịch sử
    guessHistory.push(guess);
    updateHistory();
    
    // LOGIC SO SÁNH
    if (guess === secretNumber) {
        // Thắng!
        gameActive = false;
        showFeedback(`🎉 Chúc mừng! Bạn đã đoán đúng số ${secretNumber} sau ${attempts} lần thử!`, 'success');
        input.disabled = true;
        document.getElementById('guessBtn').disabled = true;
        
        // Update best score
        updateBestScore();
        
        // Hiển thị pháo hoa
        showFireworks();
    } else if (guess < secretNumber) {
        showFeedback(`📈 Số bạn đoán quá thấp! Hãy thử số lớn hơn.`, 'hint');
    } else {
        showFeedback(`📉 Số bạn đoán quá cao! Hãy thử số nhỏ hơn.`, 'hint');
    }
    
    // Clear input và focus
    input.value = '';
    input.focus();
}

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

function updateHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    guessHistory.forEach(guess => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.textContent = guess;
        historyList.appendChild(item);
    });
}

function loadBestScore() {
    const bestScore = localStorage.getItem('bestScore');
    if (bestScore) {
        document.getElementById('bestScore').textContent = bestScore;
    }
}

function updateBestScore() {
    const currentBest = localStorage.getItem('bestScore');
    
    if (!currentBest || attempts < parseInt(currentBest)) {
        localStorage.setItem('bestScore', attempts);
        document.getElementById('bestScore').textContent = attempts;
    }
}

function showFireworks() {
    const container = document.getElementById('fireworks');
    if (!container) return;
    
    // Tạo 30 pháo hoa
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            createFirework(container);
        }, i * 100);
    }
    
    // Clear sau 3 giây
    setTimeout(() => {
        container.innerHTML = '';
    }, 3000);
}

function createFirework(container) {
    // RANDOM POSITIONING: Vị trí ngẫu nhiên trên màn hình
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight * 0.5; // Nửa trên màn hình
    
    // Tạo firework chính
    const firework = document.createElement('div');
    firework.className = 'firework';
    firework.style.left = x + 'px';
    firework.style.top = y + 'px';
    
    // Random color
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    firework.style.background = color;
    
    container.appendChild(firework);
    
    // Tạo particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'firework-particle';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.background = color;
        
        // Random direction
        const angle = (i / 12) * Math.PI * 2;
        const distance = 50 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        
        container.appendChild(particle);
        
        // Remove sau animation
        setTimeout(() => {
            particle.remove();
        }, 2000);
    }
    
    // Remove firework sau animation
    setTimeout(() => {
        firework.remove();
    }, 1000);
}

// ========================================
// CONTACT FORM
// ========================================

if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', handleContactSubmit);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    alert(`Cảm ơn ${name}!\n\nTin nhắn của bạn đã được gửi thành công.\n\nChúng tôi sẽ phản hồi sớm nhất có thể qua email: ${email}`);
    
    e.target.reset();
}
